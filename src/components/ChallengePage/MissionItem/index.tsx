import { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { MyButton } from '../../Common';
import styles from './styles';
import {
  MissionStatusOptions,
  MISSION_STATUS,
  notificationMissionAddresses,
  OAT_INFO,
} from '../../../constants/challenge';
import { useNavigate } from '@tanstack/react-router';
import images from '../../../images';
import Skeleton from '../../Common/Skeleton';

interface MissionItemProps {
  oatAddress?: string;
  missionStatus: MissionStatusOptions;
  isLoaded?: boolean;
}

const MissionItem = ({
  oatAddress,
  missionStatus,
  isLoaded,
}: MissionItemProps) => {
  const isUpcoming = missionStatus === MissionStatusOptions.UPCOMING;
  const missionIndex = oatAddress ? OAT_INFO[oatAddress].missionIndex : '';
  const _priority = oatAddress ? OAT_INFO[oatAddress].priority : '';
  const missionTitle = oatAddress ? OAT_INFO[oatAddress].describeTitle : '';
  const oatImg = oatAddress ? images[OAT_INFO[oatAddress].img] : '';
  const isNewMission =
    notificationMissionAddresses.indexOf(oatAddress || '',
    ) >= 0;

  const [isImgLoading, setIsImgLoading] = useState(true);
  const navigate = useNavigate();
  return (
    <div sx={styles.container}>
      <div sx={styles.mainLayout}>
        <div sx={styles.firstSectionWrapper}>
          <div
            sx={styles.taskStatusWrapper}
            style={{ background: MISSION_STATUS[missionStatus].color }}
          >
            {!isUpcoming && (
              <Skeleton
                isLoaded={isLoaded}
                className='skeleton skeleton-type-button'
              />
            )}
            {!isMobile && MISSION_STATUS[missionStatus].content}
          </div>
          <div sx={styles.oatImgWrapper}>
            {!isUpcoming && (
              <Skeleton isLoaded={!isImgLoading} className='skeleton' />
            )}
            {oatAddress && (
              <img
                src={oatImg}
                onLoad={() => setIsImgLoading(false)}
                width='60px'
                height='72px'
                loading='lazy'
                alt={oatImg}
              />
            )}
            {isUpcoming && <div sx={styles.upcomingImg} />}
          </div>
        </div>
        <div>
          {!isUpcoming && (
            <p sx={styles.newTask}>{isNewMission ? 'New' : ''}</p>
          )}
          <div
            sx={styles.titleWrapper}
            style={isUpcoming ? { color: '#D9D9D9' } : {}}
          >
            {!isUpcoming && <h4>Mission {missionIndex}</h4>}
            <p>{isUpcoming ? 'Upcoming Mission' : missionTitle}</p>
          </div>
          <p sx={styles.newTask} />
        </div>
      </div>
      <div sx={styles.btnWrapper}>
        {!isUpcoming && (
          <Skeleton
            isLoaded={isLoaded}
            className='skeleton skeleton-type-button'
          />
        )}
        <MyButton
          onClick={() => navigate({ to: `/play2earn/${oatAddress}` })}
          disabled={isUpcoming}
        >
          {MISSION_STATUS[missionStatus].btnContent}
        </MyButton>
      </div>
    </div>
  );
};

export default MissionItem;
