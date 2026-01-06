import { useSwitchChain } from 'wagmi';
import { ChainId } from '../../constants';

export interface WrongNetworkCheckWrapperInterface
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isDisabledWhenNotPrepared?: boolean;
  isCorrectNetwork?: boolean;
  targetNetwork?: ChainId;
}

const withWrongNetworkCheckWrapper =
  <T extends object>(WrappedComponent: React.ComponentType<T>) =>
  (props: T & WrongNetworkCheckWrapperInterface) => {
    const {
      isDisabledWhenNotPrepared,
      isCorrectNetwork,
      targetNetwork,
      onClick,
      disabled,
      children,
    } = props;

    const {switchChain, isPending} = useSwitchChain()

    const isDisabled = isCorrectNetwork ? disabled : isDisabledWhenNotPrepared;
    const handleClick = isCorrectNetwork
      ? onClick
      : () => switchChain({chainId: targetNetwork ?? ChainId.MAINNET});
    const childrenElement =
      !isCorrectNetwork && !isDisabledWhenNotPrepared
        ? 'Change Network'
        : children;

    const wrappedComponentProps = {
      ...props,
      children: childrenElement,
      disabled: isDisabled || isPending,
      onClick: handleClick,
    };

    return <WrappedComponent {...wrappedComponentProps} />;
  };

export default withWrongNetworkCheckWrapper;
