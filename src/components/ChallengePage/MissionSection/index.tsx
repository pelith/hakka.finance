 /** @jsxImportSource theme-ui */


import { isMobile } from 'react-device-detect';
import { MyButton } from '../../Common';
import Accordion from '../../Common/Accordion';
import MissionStatusHint from '../MissionStatusHint';
import MissionItem from '../MissionItem';
import styles from './styles';
import {
  LevelInfo,
  MissionStatusOptions,
  OAT_INFO,
} from '../../../constants/challenge';

import type { CampaignsInfoType } from '../../../hooks/useProjectGalaxyCampaignsInfo';

interface MissionSectionProps {
  campaignsInfo: CampaignsInfoType | undefined;
  isLoaded: boolean;
  userLevel: `${number}`;
}

const MissionSection = ({
  campaignsInfo,
  isLoaded,
  userLevel,
}: MissionSectionProps) => {
  const userLevelNumber = Number.parseInt(userLevel);
  return (
    <div>
      <div sx={styles.missionHeader}>
        <h4>Missions</h4>
        {!isMobile && (
          <div sx={{ width: '160px' }}>
            <MyButton
              onClick={() =>
                window.open(
                  'https://galaxy.eco/galaxyid',
                  '_blank',
                  'noopener, noreferrer',
                )
              }
            >
              View my NFTs
            </MyButton>
          </div>
        )}
      </div>
      {isMobile && <MissionStatusHint />}
      {Object.keys(LevelInfo)
        .reverse()
        .map((levelValue, index) => {
          if (userLevelNumber >= Number.parseInt(levelValue, 10)) {
            return (
              <div key={levelValue} sx={styles.missionItemWrapper}>
                <Accordion
                  headerContent={`level ${levelValue}`}
                  headerBgColor={LevelInfo[levelValue as `${number}`].levelColor}
                  isDefaultOpen={userLevel === levelValue}
                >
                  {LevelInfo[levelValue as `${number}`].missionList.map(
                    (oatAddress, index) => (
                      <div key={`${oatAddress}`}>
                        <MissionItem
                          oatAddress={oatAddress}
                          missionStatus={
                            campaignsInfo?.[oatAddress]?.status ||
                            MissionStatusOptions.UNFINISHED
                          }
                          isLoaded={isLoaded}
                        />
                        <hr sx={styles.hr} />
                      </div>
                    ),
                  )}
                  {LevelInfo[levelValue as `${number}`].missionList.length <
                    LevelInfo[levelValue as `${number}`].expectedMissionAmount && (
                    <MissionItem
                      missionStatus={MissionStatusOptions.UPCOMING}
                    />
                  )}
                </Accordion>
              </div>
            );
          }
          return null
        })}
    </div>
  );
};

export default MissionSection;
