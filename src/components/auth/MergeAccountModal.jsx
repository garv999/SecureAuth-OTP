import Modal from '../Modal';
import Button from '../common/Button';

const MergeAccountModal = ({ isOpen, onClose, onConfirm, phone, email }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Merge Account"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={onConfirm} className="flex-1">Merge Identities</Button>
        </>
      }
    >
      <p className="mb-4">
        This phone number ({phone}) already belongs to another SecureAuth account linked with {email}.
      </p>
      <p>Would you like to merge both identities into a single account?</p>
    </Modal>
  );
};

export default MergeAccountModal;
