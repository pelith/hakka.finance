/** @jsx jsx */
import { jsx } from 'theme-ui';
import React, { useState, useEffect, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import useTokenPrice from '../../hooks/useTokenPrice';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import images from '../../images';
import styles from './styles';
import RewardsPoolCard from './RewardsPoolCard';
import Web3Status from '../Web3Status';
import { ChainId } from '../../constants';
import { REWARD_POOLS } from '../../constants/rewards';
import { POOL_ASSETES } from '../../constants/rewards/assets';
import { tryParseAmount } from '../../utils';
import { useRewardsData } from '../../data/RewardsData';

const RewardsPage = () => {
  const { account, chainId } = useWeb3React();
  const [currentChain, setCurrentChain] = useState<ChainId>(ChainId.MAINNET);
  const [isShowArchived, setIsShowArchived] = useState<boolean>(true);
  
  enum SortOptions {
    LATEST = 'latest',
    APR = 'apr',
  }
  const [sortBy, setSortBy] = useState(SortOptions.LATEST);
  const SORT_OPTIONS = [
    {
      label: "Latest",
      value: SortOptions.LATEST,
    },
    {
      label: "APR",
      value: SortOptions.APR,
    },
  ]; 
  
  const currentPoolAddresses = useMemo(() => Object.keys(REWARD_POOLS).filter((poolAddress) => REWARD_POOLS[poolAddress].chain === currentChain), [currentChain]);
  const activePools = useMemo(() => currentPoolAddresses.filter((poolAddress) => !REWARD_POOLS[poolAddress].archived), [currentPoolAddresses]);
  const archivedPools = useMemo(() => currentPoolAddresses.filter((poolAddress) => REWARD_POOLS[poolAddress].archived), [currentPoolAddresses]);
  const decimals = useMemo(() => currentPoolAddresses.map((pool) => POOL_ASSETES[pool]?.decimal || 18), [currentPoolAddresses])

  const hakkaPrice = useTokenPrice('hakka-finance');
  const rewardData = useRewardsData(currentPoolAddresses, decimals);
  const [apr, setApr] = useState({});
  const [isShowStakedOnly, setIsShowStakedOnly] = useState(false);

  const stakedPoolAddresses = useMemo(() => Object.keys(REWARD_POOLS).filter((poolAddress) => !!rewardData.depositBalances && rewardData.depositBalances[poolAddress]?.toSignificant() > 0), [rewardData]);
  const stakedActivePools = useMemo(() => activePools.filter((poolAddress) => stakedPoolAddresses.indexOf(poolAddress) > -1), [activePools, stakedPoolAddresses]);
  const stakedArchivedPools = useMemo(() => archivedPools.filter((poolAddress) => stakedPoolAddresses.indexOf(poolAddress) > -1), [archivedPools, stakedPoolAddresses]);

  const sortedByAprActivePools = useMemo(()=>{
    const copyActivePools = [...activePools];
    if (Object.keys(apr).length > 0) {
      return copyActivePools.sort((a, b)=> {
        return apr[b].sub(apr[a])
      })
    } else {
      return activePools;
    }
  }, [activePools, apr]);

  const sortedByAprStakedActivePools = useMemo(()=>{
    const copyStakedActivePools = [...stakedActivePools];
    if (Object.keys(apr).length > 0) {
      return copyStakedActivePools.sort((a, b)=> {
        return apr[b].sub(apr[a])
      })
    } else {
      return stakedActivePools;
    }
  }, [stakedActivePools, apr]);

  const sortedActivePools = useMemo(() => {
    let sortedActivePools = [];
    switch (sortBy) {
      case SortOptions.LATEST : {
        sortedActivePools = activePools
        break;
      }
      case SortOptions.APR: {
        sortedActivePools = sortedByAprActivePools;
        break;
      }
    }
    return sortedActivePools;
  } ,[activePools, sortedByAprActivePools, sortBy]);
  
  const sortedStakedActivePools = useMemo(() => {
    let sortedStakedActivePools = [];
    switch (sortBy) {
      case SortOptions.LATEST : {
        sortedStakedActivePools = stakedActivePools;
        break;
      }
      case SortOptions.APR: {
        sortedStakedActivePools = sortedByAprStakedActivePools
        break;
      }
    }
    return sortedStakedActivePools;
  } ,[stakedActivePools, sortedByAprStakedActivePools, sortBy]);

  useEffect(() => {
    if (chainId === ChainId.MAINNET || chainId === ChainId.BSC || chainId === ChainId.POLYGON) {
      setCurrentChain(chainId);
    }
  }, [chainId]);

  useEffect(() => {
    let active = true;
    if (hakkaPrice) {
      loadApr();
    }

    async function loadApr() {
      try {
        setApr({});
        const aprList = await Promise.all(Object.keys(REWARD_POOLS).map((address) => POOL_ASSETES[address].getApr(parseUnits(hakkaPrice.toString(), 18))));
        const newApr = {}
        aprList.map((apr, index) => {
          newApr[REWARD_POOLS[Object.keys(REWARD_POOLS)[index]].rewardsAddress] = apr;
        });
        if (!active) { return }
        setApr(newApr);
      } catch (e) {
        console.error(e);

        setTimeout(() => {
          loadApr();
        }, 1000);
      }
    }
    
    return () => { active = false }
  }, [hakkaPrice]);

  const rewardsPoolRenderer = (pool, active = false) => (
    <RewardsPoolCard
      key={pool.rewardsAddress}
      tokenImage={POOL_ASSETES[pool.rewardsAddress].icon}
      title={pool.name}
      subtitle={pool.subtitle}
      url={pool.url}
      linkContent={pool.website}
      btnContent={active ? 'Deposit / Withdraw' : 'Withdraw'}
      depositedTokenSymbol={pool.tokenSymbol}
      rewardsAddress={pool.rewardsAddress}
      apr={apr[pool.rewardsAddress] ? tryParseAmount(formatUnits(apr[pool.rewardsAddress]?.mul(100), 18)).toFixed(2) : '-'}
      depositedBalance={account ? rewardData.depositBalances[pool.rewardsAddress]?.toFixed(2) : '-'}
      earnedBalance={account ? rewardData.earnedBalances[pool.rewardsAddress]?.toFixed(2) : '-'}
    />
  );

  interface RewardsPoolsContainerProps {
    pools: string[];
    active?: boolean;
  }

  const RewardsPoolsContainer = ({ pools, active}: RewardsPoolsContainerProps) => {
    return(
      <>
        {pools.filter((poolAddress) => REWARD_POOLS[poolAddress].chain === currentChain) // add `|| REWARD_POOLS[poolAddress].chain === ChainId.KOVAN` when test on kovan
        .map((poolAddress) => rewardsPoolRenderer(REWARD_POOLS[poolAddress], active))}
      </>
    )
  }

  return (
    <div sx={styles.container}>
      <div sx={styles.rewardsPageWrapper}>
        <div sx={styles.header}>
          <p>Farms</p>
          <Web3Status />
        </div>
        <div sx={styles.displayOption}>
          <div sx={styles.chainSwitch}>
            <div onClick={() => setCurrentChain(ChainId.MAINNET)} sx={currentChain === ChainId.MAINNET ? styles.chainActive : ''}>Ethereum</div>
            <div onClick={() => setCurrentChain(ChainId.BSC)} sx={currentChain === ChainId.BSC ? styles.chainActive : ''}>Binance Smart Chain</div>
            <div onClick={() => setCurrentChain(ChainId.POLYGON)} sx={currentChain === ChainId.POLYGON ? styles.chainActive : ''}>Polygon</div>
          </div>
          <div sx={styles.sortController}>
            <label sx={styles.checkBoxLabel}>
              <input
                sx={styles.checkBox}
                type="checkbox"
                onChange={()=>setIsShowStakedOnly(!isShowStakedOnly)}
              />
              {isShowStakedOnly ? <img src={images.iconChekBoxChecked} /> : <img src={images.iconChekBoxUnchecked} />}
              <span>Staked Only</span>
            </label>
            <div>
              <span>Sort by: </span>
              <select sx={styles.menu} onChange={(e)=> setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((option) => (
                  <option value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div>
          <p sx={styles.activeTitle}>Active ({activePools.length})</p>
          <div sx={styles.poolContainer}>
            <RewardsPoolsContainer pools={isShowStakedOnly ? sortedStakedActivePools : sortedActivePools } active />
          </div>
        </div>
        <div>
          <div sx={{ display: 'inline-block' }}>
            <div onClick={() => setIsShowArchived(!isShowArchived)} sx={styles.archivedTitle}>
              <p>Archived ({archivedPools.length})</p>
              <img src={isShowArchived ? images.iconUp : images.iconDown} />
            </div>
          </div>
          {isShowArchived &&
            <div sx={styles.poolContainer}>
              <RewardsPoolsContainer pools={isShowStakedOnly ? stakedArchivedPools : archivedPools } />
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
