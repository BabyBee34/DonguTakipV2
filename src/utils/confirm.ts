import React, { useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';

interface ConfirmState {
  visible: boolean;
  title: string;
  message: string;
  resolve?: (value: boolean) => void;
}

/**
 * Promise tabanlı confirm hook
 * 
 * Kullanım:
 * const { confirm, ConfirmPortal } = useConfirm();
 * 
 * async function handleAction() {
 *   const ok = await confirm('Başlık', 'Mesaj');
 *   if (ok) { ... }
 * }
 * 
 * return (<>{...} {ConfirmPortal}</>);
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    visible: false,
    title: '',
    message: '',
  });

  function confirm(title: string, message: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      setState({ visible: true, title, message, resolve });
    });
  }

  function onConfirm() {
    state.resolve?.(true);
    setState((s) => ({ ...s, visible: false }));
  }

  function onCancel() {
    state.resolve?.(false);
    setState((s) => ({ ...s, visible: false }));
  }

  const modal = React.createElement(ConfirmModal, {
    visible: state.visible,
    title: state.title,
    message: state.message,
    onConfirm,
    onCancel,
  });

  return { confirm, ConfirmPortal: modal };
}

