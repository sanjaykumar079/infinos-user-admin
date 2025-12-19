import React, { useState } from 'react';
import { deviceAPI } from '../utils/api';

const ClaimDeviceModal = ({ user, onClose, onDeviceClaimed }) => {
  const [step, setStep] = useState(1); // 1: Enter code, 2: Verify, 3: Name device
  const [deviceCode, setDeviceCode] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceInfo, setDeviceInfo] = useState(null);

  const verifyCode = async () => {
    if (!deviceCode.trim()) {
      setError('Please enter a device code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await deviceAPI.verifyDeviceCode(deviceCode.trim().toUpperCase());

      if (response.data.valid) {
        setDeviceInfo(response.data.device);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid device code');
    } finally {
      setLoading(false);
    }
  };

  const claimDevice = async () => {
    if (!deviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await deviceAPI.claimDevice(
        deviceCode.trim().toUpperCase(),
        user.id,
        deviceName.trim()
      );

      if (response.data.device) {
        onDeviceClaimed?.();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim device');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.iconWrapper}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <path d="M12 18h.01"/>
              </svg>
            </div>
            <div>
              <h2 style={styles.title}>
                {step === 1 ? 'Claim Your Device' : 'Name Your Device'}
              </h2>
              <p style={styles.subtitle}>
                {step === 1 
                  ? 'Enter the code from your device box or scan QR code'
                  : 'Give your device a memorable name'}
              </p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Progress Indicator */}
        <div style={styles.progress}>
          <div style={{...styles.progressStep, ...(step >= 1 ? styles.progressStepActive : {})}}>
            <div style={styles.progressDot}>{step > 1 ? '✓' : '1'}</div>
            <span style={styles.progressLabel}>Enter Code</span>
          </div>
          <div style={styles.progressLine} />
          <div style={{...styles.progressStep, ...(step >= 2 ? styles.progressStepActive : {})}}>
            <div style={styles.progressDot}>{step > 2 ? '✓' : '2'}</div>
            <span style={styles.progressLabel}>Name Device</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Enter Code */}
        {step === 1 && (
          <div style={styles.content}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Device Code</label>
              <input
                type="text"
                placeholder="INF-XXXX-XXXX"
                value={deviceCode}
                onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => handleKeyPress(e, verifyCode)}
                style={styles.input}
                autoFocus
                maxLength={13}
              />
              <p style={styles.hint}>
                Enter the 12-character code found on your device box
              </p>
            </div>

            <div style={styles.qrSection}>
              <div style={styles.qrIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <p style={styles.qrText}>
                Or scan the QR code on your device box
              </p>
              <button style={styles.secondaryBtn} disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="m21 15-5-5L5 21"/>
                </svg>
                Scan QR Code (Coming Soon)
              </button>
            </div>

            <button
              style={{...styles.primaryBtn, ...(loading ? styles.btnDisabled : {})}}
              onClick={verifyCode}
              disabled={loading || !deviceCode.trim()}
            >
              {loading ? (
                <>
                  <div style={styles.spinner} />
                  Verifying...
                </>
              ) : (
                <>
                  Continue
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Name Device */}
        {step === 2 && (
          <div style={styles.content}>
            <div style={styles.deviceInfoCard}>
              <div style={styles.deviceInfoIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3 8-8"/>
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>
                </svg>
              </div>
              <div>
                <h3 style={styles.deviceInfoTitle}>Device Verified!</h3>
                <p style={styles.deviceInfoText}>Code: {deviceInfo?.deviceCode}</p>
                {deviceInfo?.hardwareVersion && (
                  <p style={styles.deviceInfoText}>Hardware: {deviceInfo.hardwareVersion}</p>
                )}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Device Name</label>
              <input
                type="text"
                placeholder="e.g., Cold Storage Unit 1"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, claimDevice)}
                style={styles.input}
                autoFocus
                maxLength={50}
              />
              <p style={styles.hint}>
                Choose a name that helps you identify this device
              </p>
            </div>

            <div style={styles.buttonGroup}>
              <button
                style={styles.secondaryBtn}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                style={{...styles.primaryBtn, ...(loading ? styles.btnDisabled : {})}}
                onClick={claimDevice}
                disabled={loading || !deviceName.trim()}
              >
                {loading ? (
                  <>
                    <div style={styles.spinner} />
                    Claiming Device...
                  </>
                ) : (
                  <>
                    Claim Device
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3 8-8"/>
                      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '24px',
    borderBottom: '1px solid #E5E7EB',
  },
  headerContent: {
    display: 'flex',
    gap: '16px',
    flex: 1,
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4ED',
    color: '#FF6B35',
    borderRadius: '12px',
    flexShrink: 0,
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    color: '#6B7280',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  progress: {
    display: 'flex',
    alignItems: 'center',
    padding: '24px',
    backgroundColor: '#F9FAFB',
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    opacity: 0.5,
    transition: 'opacity 0.3s',
  },
  progressStepActive: {
    opacity: 1,
  },
  progressDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#FF6B35',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  progressLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
  },
  progressLine: {
    height: '2px',
    backgroundColor: '#E5E7EB',
    flex: '0 0 40px',
    margin: '0 8px 20px',
  },
  content: {
    padding: '24px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '0 24px 24px',
    padding: '12px 16px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    height: '44px',
    padding: '0 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'monospace',
    transition: 'all 0.2s',
    outline: 'none',
  },
  hint: {
    fontSize: '12px',
    color: '#6B7280',
    margin: '8px 0 0 0',
  },
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  qrIcon: {
    color: '#9CA3AF',
    marginBottom: '12px',
  },
  qrText: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 16px 0',
    textAlign: 'center',
  },
  primaryBtn: {
    width: '100%',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  secondaryBtn: {
    height: '44px',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid white',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  deviceInfoCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#D1FAE5',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  deviceInfoIcon: {
    color: '#059669',
    flexShrink: 0,
  },
  deviceInfoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#065F46',
    margin: '0 0 4px 0',
  },
  deviceInfoText: {
    fontSize: '14px',
    color: '#047857',
    margin: '0 0 2px 0',
  },
};

export default ClaimDeviceModal;