import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { CeremonyObject } from '../../types/ceremony';
import type { ClientToServerMessage } from '../../types/protocol';
import type { ActiveDragState } from '../../lib/websocket';
import { DragEmitter } from '../../lib/websocket';
import { ParticleTrailCanvas } from './ParticleTrailCanvas';
import { useAudio } from '../../hooks/useAudio';

interface DigitalObjectProps {
  id: CeremonyObject;
  label: string;
  isCompleted: boolean;
  isNewlyCompleted?: boolean;
  position: { top: string; left: string };
  delay: number;
  targetRef?: React.RefObject<HTMLDivElement | null>;
  onAttemptComplete?: (id: CeremonyObject) => void;
  sendMessage?: (msg: ClientToServerMessage) => void;
  clientId?: string;
}

export function DigitalObject({ id, label, isCompleted, isNewlyCompleted, position, delay, targetRef, onAttemptComplete, sendMessage, clientId }: DigitalObjectProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [isEmitting, setIsEmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(!isCompleted);
  const impactAudio = useAudio('/assets/sounds/value-impact.mp3');

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastSendTime = useRef(0);
  const remoteDragRef = useRef(false);
  const hasRunSequence = useRef(false);

  useEffect(() => {
    // Initial float (only if not completed, not locally dragging, and not remote dragging)
    if (!isCompleted && !isDragging && !remoteDragRef.current) {
      controls.start({
        opacity: 1,
        scale: 1,
        y: [0, -10, 0],
        filter: 'brightness(1) drop-shadow(0 0 0px transparent)',
        transition: {
          opacity: { duration: 1 },
          scale: { duration: 1 },
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: delay },
        },
      });
    }
  }, [isCompleted, isDragging, controls, delay]);

  // Handle remote drag mirroring
  useEffect(() => {
    const unsub = DragEmitter.subscribe((activeDrag) => {
      if (isCompleted || isNewlyCompleted || isDragging) return;

      if (activeDrag?.object === id && activeDrag.clientId !== clientId) {
        if (!remoteDragRef.current) {
          controls.stop();
          setIsEmitting(true);
          controls.start({
            scale: 1.15,
            filter: 'brightness(1.5) drop-shadow(0 0 20px rgba(160, 42, 152, 0.8))',
            transition: { duration: 0.2 },
          });
          remoteDragRef.current = true;
        }
        controls.set({
          x: activeDrag.x * window.innerWidth,
          y: activeDrag.y * window.innerHeight,
        });
      } else if (remoteDragRef.current) {
        remoteDragRef.current = false;
        setIsEmitting(false);
        controls.start({
          x: 0,
          y: 0,
          scale: 1,
          filter: 'brightness(1) drop-shadow(0 0 0px transparent)',
          transition: { type: 'spring', stiffness: 300, damping: 20 },
        });
      }
    });
    
    return unsub;
  }, [id, clientId, isCompleted, isNewlyCompleted, isDragging, controls]);

  useEffect(() => {
    if (isCompleted && isNewlyCompleted) {
      if (hasRunSequence.current) return;
      hasRunSequence.current = true;

      setIsVisible(true);
      const runSequence = async () => {
        // 0.0s - 0.4s: Brighten and charge up
        await controls.start({
          filter: 'brightness(1.8) drop-shadow(0 0 20px rgba(212, 175, 55, 0.8))',
          scale: 1.15,
          y: 0, // stop floating
          transition: { duration: 0.4, ease: 'easeOut' },
        });

        // Calculate dynamic travel delta based on exact DOM rects
        let deltaX: string | number = `calc(50vw - ${position.left})`;
        let deltaY: string | number = `calc(50vh - ${position.top})`;

        if (nodeRef.current && targetRef?.current) {
          const nodeRect = nodeRef.current.getBoundingClientRect();
          const targetRect = targetRef.current.getBoundingClientRect();

          const nodeCenterX = nodeRect.left + nodeRect.width / 2;
          const nodeCenterY = nodeRect.top + nodeRect.height / 2;

          const targetCenterX = targetRect.left + targetRect.width / 2;
          const targetCenterY = targetRect.top + targetRect.height / 2;

          // Calculate remaining distance from current dropped position
          const remainingX = targetCenterX - nodeCenterX;
          const remainingY = targetCenterY - nodeCenterY;

          // Read current transform to add the remaining distance
          const transform = window.getComputedStyle(nodeRef.current).transform;
          let currentX = 0; let currentY = 0;
          if (transform && transform !== 'none') {
            const matrix = new DOMMatrixReadOnly(transform);
            currentX = matrix.m41;
            currentY = matrix.m42;
          }

          deltaX = currentX + remainingX;
          deltaY = currentY + remainingY;
        }
        
        setIsEmitting(true);
        
        // 0.4s - 1.3s: Travel to exact center with smooth cinematic easing
        await controls.start({
          x: deltaX,
          y: deltaY,
          scale: 0.85,
          transition: { duration: 0.9, ease: [0.4, 0.0, 0.2, 1] }, // Cinematic easeInOut
        });
        
        setIsEmitting(false);
        
        // 1.3s - 1.6s: Impact
        await controls.start({
          opacity: 0,
          scale: 0.2,
          filter: 'brightness(3) blur(10px)',
          transition: { duration: 0.3, ease: 'easeOut' },
        });
        
        setIsVisible(false);
      };
      runSequence();
    } else if (isCompleted) {
      setIsVisible(false);
    } else if (!isCompleted) {
      // Ceremony was reset, allow it to play again if completed in the future
      hasRunSequence.current = false;
      setIsVisible(true);
    }
  }, [isCompleted, isNewlyCompleted, controls, position, targetRef, impactAudio, id]);

  // Pointer Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCompleted || isNewlyCompleted) return;
    
    impactAudio.unlock(); // Safely unlock browser audio policies during user gesture

    // Capture pointer to track it outside the element bounds
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    
    controls.stop();
    setIsDragging(true);
    setIsEmitting(true);

    let currentX = 0; let currentY = 0;
    if (nodeRef.current) {
      const transform = window.getComputedStyle(nodeRef.current).transform;
      if (transform && transform !== 'none') {
        const matrix = new DOMMatrixReadOnly(transform);
        currentX = matrix.m41;
        currentY = matrix.m42;
      }
    }

    dragStart.current = {
      x: e.clientX - currentX,
      y: e.clientY - currentY,
    };

    controls.start({
      scale: 1.15,
      filter: 'brightness(1.5) drop-shadow(0 0 20px rgba(160, 42, 152, 0.8))',
      transition: { duration: 0.2 },
    });

    if (clientId) {
      sendMessage?.({
        type: 'DRAG_START',
        object: id,
        clientId,
        x: currentX / window.innerWidth,
        y: currentY / window.innerHeight,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    controls.set({ x: newX, y: newY });

    if (clientId) {
      const now = Date.now();
      if (now - lastSendTime.current > 30) {
        sendMessage?.({
          type: 'DRAG_MOVE',
          object: id,
          clientId,
          x: newX / window.innerWidth,
          y: newY / window.innerHeight,
        });
        lastSendTime.current = now;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore if pointer capture was already lost
    }

    if (clientId) {
      sendMessage?.({ type: 'DRAG_END', object: id, clientId });
    }

    let dropped = false;
    if (nodeRef.current && targetRef?.current) {
      const nodeRect = nodeRef.current.getBoundingClientRect();
      const targetRect = targetRef.current.getBoundingClientRect();
      
      const nodeCenterX = nodeRect.left + nodeRect.width / 2;
      const nodeCenterY = nodeRect.top + nodeRect.height / 2;
      
      const hitPadding = 80; // Generous drop radius
      if (
        nodeCenterX >= targetRect.left - hitPadding &&
        nodeCenterX <= targetRect.right + hitPadding &&
        nodeCenterY >= targetRect.top - hitPadding &&
        nodeCenterY <= targetRect.bottom + hitPadding
      ) {
        dropped = true;
        onAttemptComplete?.(id);
      }
    }

    if (!dropped) {
      setIsEmitting(false);
      controls.start({
        x: 0,
        y: 0, // Spring back to center anchor
        scale: 1,
        filter: 'brightness(1) drop-shadow(0 0 0px transparent)',
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      });
    }
  };

  return (
    <>
      {/* High-performance Canvas Particle Trail */}
      <ParticleTrailCanvas isEmitting={isEmitting} nodeRef={nodeRef} />
      
      <div className="digital-object-container" style={position}>
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={nodeRef}
              key={id}
              className="digital-object"
              style={{ touchAction: 'none' }} // Prevent scrolling on touch devices during drag
              initial={{ opacity: 0, scale: 0.8 }}
              animate={controls}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              exit={
                isNewlyCompleted
                  ? { opacity: 0 } // Sequence handles fade out, so just quietly unmount
                  : {
                      opacity: 0,
                      scale: 0.2,
                      x: targetRef?.current ? (targetRef.current.getBoundingClientRect().left + targetRef.current.getBoundingClientRect().width / 2) - (nodeRef.current ? nodeRef.current.getBoundingClientRect().left + nodeRef.current.getBoundingClientRect().width / 2 : 0) : `calc(50vw - ${position.left})`,
                      y: targetRef?.current ? (targetRef.current.getBoundingClientRect().top + targetRef.current.getBoundingClientRect().height / 2) - (nodeRef.current ? nodeRef.current.getBoundingClientRect().top + nodeRef.current.getBoundingClientRect().height / 2 : 0) : `calc(50vh - ${position.top})`,
                      filter: 'blur(4px)',
                      transition: { duration: 1.2, ease: 'easeIn' },
                    }
              }
            >
              <div className="node-visual">
                <div className="node-core" />
                <div className="node-ring" />
                <div className="node-flare" />
                <div className="node-gold-spark" />
              </div>
              <div className="label-container">
                <span className="digital-label">{label}</span>
                <div className="label-gold-accent" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
