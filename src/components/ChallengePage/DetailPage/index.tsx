/** @jsxImportSource theme-ui */

import { useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Web3Status from '../../Web3Status';
import styles from './styles';
import images from '../../../images';
import {
  MissionStatusOptions,
  MISSION_STATUS,
  OAT_INFO,
} from '../../../constants/challenge';
import { MyButton } from '../../Common';
import useProjectGalaxyCampaignsInfo from '../../../hooks/useProjectGalaxyCampaignsInfo';

interface ChallengeDetailPageProps {
  oatId: string;
}

const ChallengeDetailPage = ({ oatId }: ChallengeDetailPageProps) => {
  const campaignsInfo = useProjectGalaxyCampaignsInfo();
  const missionStatus =
    campaignsInfo?.[oatId]?.status || MissionStatusOptions.UNFINISHED;
  const isMissionUnfinished = useMemo(
    () => missionStatus === MissionStatusOptions.UNFINISHED,
    [missionStatus],
  );
  const isBrowser = typeof window !== 'undefined';
  const navigate = useNavigate();
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    const localStorageViewedPages = window.localStorage.getItem('viewed-pages');
    const viewedPages: string[] = localStorageViewedPages
      ? JSON.parse(localStorageViewedPages)
      : [];

    if (viewedPages.findIndex((address) => address === oatId) === -1) {
      viewedPages.push(oatId);
      window.localStorage.setItem('viewed-pages', JSON.stringify(viewedPages));
    }
  }, []);

  return (
    <div sx={styles.container}>
      <div sx={styles.detailPageWrapper}>
        <div sx={{ ...styles.header }}>
          <p>Play To Earn</p>
          <Web3Status />
        </div>
        <div
          sx={{
            display: 'inline-block',
            marginBottom: '35px',
            textDecoration: 'none',
          }}
          onClick={() => navigate({ to: '/play2earn' })}
        >
          <div sx={styles.btnBack}>
            <img src={images.iconBack} alt='Back to mission list' />
            <span>Back to mission list</span>
          </div>
        </div>
        <div sx={styles.mainLayout}>
          <div sx={styles.oatWrapper}>
            <img
              sx={styles.oat}
              src={images[OAT_INFO[oatId].img]}
              alt={OAT_INFO[oatId].img}
            />
            <img src={images.iconOat} alt='OAT' />
          </div>
          <div>
            <div sx={styles.infoHeader}>
              <p sx={styles.missionIndex}>
                Mission {OAT_INFO[oatId].missionIndex}
              </p>
              <div
                sx={styles.statusItem}
                style={{ background: MISSION_STATUS[missionStatus].color }}
              >
                {MISSION_STATUS[missionStatus].content}
              </div>
            </div>
            <h4 sx={styles.missionTitle}>{OAT_INFO[oatId].describeTitle}</h4>
            <div sx={styles.buttonWrapper}>
              <MyButton
                onClick={() =>
                  window.open(
                    OAT_INFO[oatId].missionLink,
                    '_blank',
                    'noopener, noreferrer',
                  )
                }
                styleKit={isMissionUnfinished ? 'green' : ''}
                disabled={!isMissionUnfinished}
              >
                Start Here
              </MyButton>
              <MyButton
                onClick={() =>
                  window.open(
                    OAT_INFO[oatId].claimLink,
                    '_blank',
                    'noopener, noreferrer',
                  )
                }
                styleKit={isMissionUnfinished ? '' : 'green'}
              >
                {missionStatus === MissionStatusOptions.FINISHED
                  ? 'Claim NFT'
                  : 'View NFT'}
              </MyButton>
            </div>
            <p sx={styles.describeContent}>{OAT_INFO[oatId].describeContent}</p>
            <p sx={styles.hintTitle}>How to complete the mission: </p>
            <ul sx={styles.ul}>
              {OAT_INFO[oatId].hint?.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailPage;
