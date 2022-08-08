/** @jsx jsx */
import { jsx } from 'theme-ui';
import React from 'react'
import { isMobile } from 'react-device-detect';
import { MyButton } from '../../Common';
import Accordion from '../../Common/Accordion';
import MissionStatusHint from '../MissionStatusHint';
import MissionItem from '../MissionItem';
import styles from './styles';
import { MissionStatusOptions, OAT_INFO } from '../../../constants/challenge';

const MissionSection = () => {
  return (
    <div>
      <div sx={styles.missionHeader}>
        <h4>Missions</h4>
        {/* TODO: link is not ready */}
        {!isMobile && (
          <div sx={{ width: '160px' }}>
            <MyButton onClick={() => {}}>View my NFTs</MyButton>
          </div>
        )}
      </div>
      {isMobile && <MissionStatusHint />}
      <Accordion headerContent='level 1'>
        {Object.keys(OAT_INFO).map((oatAddress, index) => (
          <div key={index}>
            <MissionItem
              oatAddress={oatAddress}
              // TODO: check status
              missionStatus={MissionStatusOptions.COMPLETED} 
            />
            <hr sx={{ margin: '0', borderTop: '0', borderColor: '#E6E6E6' }} />
          </div>
        ))}
        <MissionItem
          missionStatus={MissionStatusOptions.UPCOMING} 
        />
      </Accordion>
    </div>
  )
}

export default MissionSection