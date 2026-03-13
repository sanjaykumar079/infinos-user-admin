import React, { useState } from 'react';
import { deviceAPI } from '../utils/api';

const ClaimDeviceModal = ({ user, onClose, onDeviceClaimed }) => {
  const [step, setStep] = useState(1); // 1: Enter code, 2: Verify, 3: Name device
  const [deviceCode, setDeviceCode] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [closeHover, setCloseHover] = useState(false);

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
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.iconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M12 18h.01" />
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
          <button
            style={{
              ...styles.closeBtn,
              ...(closeHover ? styles.closeBtnHover : {})
            }}
            onClick={onClose}
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Progress Indicator */}
        <div style={styles.progress}>
          <div style={{ ...styles.progressStep, ...(step >= 1 ? styles.progressStepActive : {}) }}>
            <div style={styles.progressDot}>{step > 1 ? '✓' : '1'}</div>
            <span style={styles.progressLabel}>Enter Code</span>
          </div>
          <div style={styles.progressLine} />
          <div style={{ ...styles.progressStep, ...(step >= 2 ? styles.progressStepActive : {}) }}>
            <div style={styles.progressDot}>{step > 2 ? '✓' : '2'}</div>
            <span style={styles.progressLabel}>Name Device</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
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
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <p style={styles.qrText}>
                Or scan the QR code on your device box
              </p>
              <button style={styles.secondaryBtn} disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                Scan QR Code (Coming Soon)
              </button>
            </div>

            <button
              style={{ ...styles.primaryBtn, ...(loading ? styles.btnDisabled : {}) }}
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
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
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
                  <path d="M9 11l3 3 8-8" />
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
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
                style={{ ...styles.primaryBtn, ...(loading ? styles.btnDisabled : {}) }}
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
                      <path d="M9 11l3 3 8-8" />
                      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '12px',
    backdropFilter: 'blur(4px)',
    overflowY: 'auto',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '480px',
    width: '100%',
    maxHeight: 'calc(100vh - 80px)',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
    margin: 'auto',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #E5E7EB',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    zIndex: 10,
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
  },
  headerContent: {
    display: 'flex',
    gap: '10px',
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4ED',
    color: '#FF6B35',
    borderRadius: '8px',
    flexShrink: 0,
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 2px 0',
  },
  subtitle: {
    fontSize: '12px',
    color: '#6B7280',
    margin: 0,
    lineHeight: '1.3',
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #D1D5DB',
    background: 'white',
    color: '#374151',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s',
    flexShrink: 0,
    fontSize: '24px',
    fontWeight: '300',
    lineHeight: '1',
    padding: 0,
  },
  closeBtnHover: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    color: '#DC2626',
  },
  progress: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
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
    padding: '16px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 16px 16px',
    padding: '10px 12px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: '16px',
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
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  qrIcon: {
    color: '#9CA3AF',
    marginBottom: '8px',
  },
  qrText: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '0 0 12px 0',
    textAlign: 'center',
  },
  primaryBtn: {
    width: '100%',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  secondaryBtn: {
    height: '40px',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
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
    gap: '12px',
    padding: '14px',
    backgroundColor: '#D1FAE5',
    borderRadius: '8px',
    marginBottom: '16px',
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