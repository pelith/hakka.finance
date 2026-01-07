import { animated, useTransition } from 'react-spring';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { isMobile } from 'react-device-detect';
import '@reach/dialog/styles.css';
import styles from './styles';

const AnimatedDialogOverlay = animated(DialogOverlay);
const AnimatedDialogContent = animated(DialogContent);

interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  initialFocusRef?: React.RefObject<any>;
  children?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onDismiss,
  initialFocusRef,
  children,
}: ModalProps) {
  const sx = styles as any;
  const fadeTransition = useTransition(isOpen, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return (
    <>
      {fadeTransition((props, item) =>
        item ? (
          <AnimatedDialogOverlay
            sx={sx.dialogOverlay}
            style={props}
            onDismiss={onDismiss}
            initialFocusRef={initialFocusRef}
          >
            <AnimatedDialogContent
              sx={sx.dialogContent}
              aria-label='dialog content'
            >
              {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
              {children}
            </AnimatedDialogContent>
          </AnimatedDialogOverlay>
        ) : null,
      )}
    </>
  );
}
