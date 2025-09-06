const constants = require('./constants');

const formatHealthMetrics = (scanResult) => {
  return {
    heartRate: {
      value: scanResult.heartRate,
      unit: 'bpm',
      status: getHeartRateStatus(scanResult.heartRate)
    },
    bloodPressure: {
      systolic: scanResult.bloodPressureSystolic,
      diastolic: scanResult.bloodPressureDiastolic,
      unit: 'mmHg',
      status: getBloodPressureStatus(
        scanResult.bloodPressureSystolic,
        scanResult.bloodPressureDiastolic
      )
    },
    temperature: {
      value: scanResult.temperature,
      unit: '°F',
      status: getTemperatureStatus(scanResult.temperature)
    },
    breathingRate: {
      value: scanResult.breathingRate,
      unit: 'breaths/min',
      status: getBreathingRateStatus(scanResult.breathingRate)
    },
    oxygenSaturation: {
      value: scanResult.oxygenSaturation,
      unit: '%',
      status: getOxygenStatus(scanResult.oxygenSaturation)
    },
    stressIndex: {
      value: scanResult.stressIndex,
      level: getStressLevel(scanResult.stressIndex)
    }
  };
};

const getHeartRateStatus = (rate) => {
  const { HEART_RATE } = constants.HEALTH_RANGES;
  if (rate < HEART_RATE.CRITICAL_LOW || rate > HEART_RATE.CRITICAL_HIGH) return 'critical';
  if (rate < HEART_RATE.MIN) return 'low';
  if (rate > HEART_RATE.MAX) return 'high';
  return 'normal';
};

const getBloodPressureStatus = (systolic, diastolic) => {
  const { SYSTOLIC, DIASTOLIC } = constants.HEALTH_RANGES.BLOOD_PRESSURE;
  if (systolic >= SYSTOLIC.HIGH || diastolic >= DIASTOLIC.HIGH) return 'high';
  if (systolic < SYSTOLIC.MIN || diastolic < DIASTOLIC.MIN) return 'low';
  return 'normal';
};

const getTemperatureStatus = (temp) => {
  const { TEMPERATURE } = constants.HEALTH_RANGES;
  if (temp >= TEMPERATURE.FEVER) return 'fever';
  if (temp < TEMPERATURE.MIN) return 'low';
  if (temp > TEMPERATURE.MAX) return 'elevated';
  return 'normal';
};

const getBreathingRateStatus = (rate) => {
  const { BREATHING_RATE } = constants.HEALTH_RANGES;
  if (rate < BREATHING_RATE.MIN) return 'low';
  if (rate > BREATHING_RATE.MAX) return 'high';
  return 'normal';
};

const getOxygenStatus = (level) => {
  const { OXYGEN_SATURATION } = constants.HEALTH_RANGES;
  if (level < OXYGEN_SATURATION.CRITICAL) return 'critical';
  if (level < OXYGEN_SATURATION.MIN) return 'low';
  return 'normal';
};

const getStressLevel = (index) => {
  const levels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
  return levels[Math.min(Math.max(index - 1, 0), 4)];
};

module.exports = {
  formatHealthMetrics,
  getHeartRateStatus,
  getBloodPressureStatus,
  getTemperatureStatus,
  getBreathingRateStatus,
  getOxygenStatus,
  getStressLevel
}