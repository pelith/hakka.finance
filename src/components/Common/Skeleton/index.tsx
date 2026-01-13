import './skeleton.css';

type Props = {
  isLoaded?: boolean;
  className: string;
};

const Skeleton = ({ isLoaded, className }: Props) => {
  if (isLoaded === undefined) {
    return null;
  }
  return (
    <div style={{ display: isLoaded ? 'none' : '' }} className={className} />
  );
};

export default Skeleton;
