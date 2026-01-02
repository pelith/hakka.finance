import { useWriteContract } from "wagmi";
import { toast } from "react-toastify";
import { getEtherscanLink, shortenTxId } from "src/utils";
import { ExternalLink } from "react-feather";
import type { ChainId } from "src/constants";

export default function useAppWriteContract(chainId: ChainId = 1) {
    return useWriteContract({
      mutation: {
        onSuccess(hash) {
          toast(
            <a
              target='_blank'
              href={getEtherscanLink(chainId, hash, 'transaction')}
              rel='noreferrer noopener'
              sx={{ textDecoration: 'none', color: '#253e47' }}
            >
              {shortenTxId(hash)} <ExternalLink size={16} />
            </a>,
            { containerId: 'tx' },
          );
        },
        onError(error) {
          console.error(error);
          toast.error(<div>{error.message}</div>, { containerId: 'error' });
        },
      },
    });

}