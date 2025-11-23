import { useState, useEffect } from 'react';
import Modal from '../../common/Modal/Modal';
import { MorningTimeService } from '../../../services/morningTimeService';
import { useAuthStore } from '../../../store/authStore';
import { INFO_MESSAGE } from '../../../constants/InfoMessage';
import './MorningTimeModal.css';

const MorningTimeModal = ({ 
  isOpen,
  onClose,
  hasTemplate,
  initialConfig,
  sha,
  onSave,
  showInfo,
  showError
}) => {
  const { token, owner, repo } = useAuthStore();
  const [greenStart, setGreenStart] = useState('06:00');
  const [greenEnd, setGreenEnd] = useState('10:00');
  const [orangeEnd, setOrangeEnd] = useState('14:00');

  useEffect(() => {
    if (initialConfig) {
      setGreenStart(initialConfig.green.start);
      setGreenEnd(initialConfig.green.end);
      setOrangeEnd(initialConfig.orange.end);
    }
  }, [initialConfig]);

  const getGreenStartOptions = () => {
    const options = [];
    for (let i = 3; i <= 15; i++) {
      const hour = String(i).padStart(2, '0');
      options.push(`${hour}:00`);
    }
    return options;
  };

  const getGreenEndOptions = () => {
    const startHour = parseInt(greenStart.split(':')[0]);
    const options = [];
    for (let i = 1; i <= 4; i++) {
      const hour = startHour + i;
      if (hour >= 24) break;
      options.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return options;
  };

  const getOrangeEndOptions = () => {
    const orangeStart = greenEnd;
    const startHour = parseInt(orangeStart.split(':')[0]);
    const options = [];
    for (let i = 1; i <= 4; i++) {
      const hour = startHour + i;
      if (hour >= 24) break;
      options.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return options;
  };

  const handleGreenStartChange = (newStart) => {
    setGreenStart(newStart);
    const startHour = parseInt(newStart.split(':')[0]);
    const endHour = parseInt(greenEnd.split(':')[0]);
    const diff = endHour - startHour;
    
    if (diff < 1 || diff > 4 || endHour >= 24) {
      const newEndHour = Math.min(startHour + 4, 23);
      setGreenEnd(`${String(newEndHour).padStart(2, '0')}:00`);
    }
  };

  const handleGreenEndChange = (newEnd) => {
    setGreenEnd(newEnd);
    const orangeStartHour = parseInt(newEnd.split(':')[0]);
    const orangeEndHour = parseInt(orangeEnd.split(':')[0]);
    const diff = orangeEndHour - orangeStartHour;
    
    if (diff < 1 || diff > 4 || orangeEndHour >= 24) {
      const newOrangeEnd = Math.min(orangeStartHour + 4, 23);
      setOrangeEnd(`${String(newOrangeEnd).padStart(2, '0')}:00`);
    }
  };

  const handleSave = async () => {
    try {
      const config = {
        green: { start: greenStart, end: greenEnd },
        orange: { start: greenEnd, end: orangeEnd }
      };

      if (initialConfig) {
        const hasChanges = 
          greenStart !== initialConfig.green.start ||
          greenEnd !== initialConfig.green.end ||
          orangeEnd !== initialConfig.orange.end;

        if (!hasChanges) {
          if (showInfo) {
            showInfo(INFO_MESSAGE.NO_CHANGE_FAVORITES);
          }
          return;
        }
      }

      const service = new MorningTimeService(token, owner, repo);
      const result = await service.saveMorningTime(config, sha);
      
      if (onSave) {
        onSave(config, result.content.sha);
      }
      
      if (showInfo) {
        showInfo(INFO_MESSAGE.MORNING_TIME_SAVED);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save morning time:', error);
      if (showError) {
        showError('저장에 실패했습니다.');
      }
    } 
  };

  if (!hasTemplate) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="morning-time-modal">
          <div className="morning-time-no-template">
            <p className="no-template-message">
              템플릿을 사용하세요
            </p>
            <p className="no-template-description">
              모닝타임을 설정하려면 템플릿 레포지토리를 사용해야 합니다.
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="morning-time-modal">
        <p className="morning-time-description">
          모닝 타임을 설정하세요. 설정한 시간에 따라 히트맵 색상이 표시됩니다.
          <br />
          시작 시간으로부터 최대 4시간까지 설정할 수 있습니다.
        </p>

        <div className="morning-time-settings">
          {/* 초록 구간 */}
          <div className="time-section">
            <div className="time-section-header">
              <span className="time-color-indicator green"></span>
              <h3 className="time-section-title">초록</h3>
            </div>
            <div className="time-inputs">
              <div className="time-input-group">
                <label htmlFor="green-start">시작 시간</label>
                <select
                  id="green-start"
                  value={greenStart}
                  onChange={(e) => handleGreenStartChange(e.target.value)}
                  className="time-select"
                >
                  {getGreenStartOptions().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <span className="time-separator">~</span>
              <div className="time-input-group">
                <label htmlFor="green-end">종료 시간</label>
                <select
                  id="green-end"
                  value={greenEnd}
                  onChange={(e) => handleGreenEndChange(e.target.value)}
                  className="time-select"
                >
                  {getGreenEndOptions().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="time-hint">시작 시간은 새벽 3시 ~ 오후 3시까지 선택 가능합니다</p>
          </div>

          {/* 주황 구간 */}
          <div className="time-section">
            <div className="time-section-header">
              <span className="time-color-indicator orange"></span>
              <h3 className="time-section-title">주황</h3>
            </div>
            <div className="time-inputs">
              <div className="time-input-group">
                <label htmlFor="orange-start">시작 시간</label>
                <input
                  id="orange-start"
                  type="text"
                  value={greenEnd}
                  readOnly
                  className="time-select readonly"
                  title="초록 종료 시간과 동일합니다"
                />
              </div>
              <span className="time-separator">~</span>
              <div className="time-input-group">
                <label htmlFor="orange-end">종료 시간</label>
                <select
                  id="orange-end"
                  value={orangeEnd}
                  onChange={(e) => setOrangeEnd(e.target.value)}
                  className="time-select"
                >
                  {getOrangeEndOptions().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 빨강 구간 안내 */}
          <div className="time-section">
            <div className="time-section-header">
              <span className="time-color-indicator red"></span>
              <h3 className="time-section-title">빨강</h3>
            </div>
            <p className="time-auto-info">
              초록, 주황 구간을 제외한 나머지 시간은 자동으로 빨강으로 표시됩니다.
            </p>
          </div>
        </div>

        <div className="morning-time-actions">
          <button className="btn-save" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MorningTimeModal;
