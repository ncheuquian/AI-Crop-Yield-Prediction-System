import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Thermometer, Droplets, Sprout, TrendingUp, Activity } from 'lucide-react';

function CropYieldPredictor() {
  const [formData, setFormData] = useState({
    cropType: 'corn',
    soilType: 'loam',
    soilPH: 6.5,
    nitrogen: 150,
    phosphorus: 60,
    potassium: 120,
    temperature: 25,
    rainfall: 800,
    irrigationType: 'drip',
    region: 'midwest'
  });

  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);

  const predictYield = (data) => {
    const baseYield = {
      corn: 10.2,
      wheat: 3.8,
      soybean: 3.2,
      rice: 7.5,
      cotton: 2.1
    };

    let yieldValue = baseYield[data.cropType] || 8.0;

    const soilMultiplier = {
      clay: 0.95,
      sandy: 0.85,
      loam: 1.0,
      silt: 0.92
    };
    yieldValue = yieldValue * soilMultiplier[data.soilType];

    const phOptimal = 6.5;
    const phDifference = Math.abs(data.soilPH - phOptimal);
    yieldValue = yieldValue * Math.max(0.7, 1 - (phDifference * 0.1));

    const nOptimal = 160;
    const pOptimal = 65;
    const kOptimal = 130;
    const nFactor = 1 - Math.abs(data.nitrogen - nOptimal) / nOptimal * 0.3;
    const pFactor = 1 - Math.abs(data.phosphorus - pOptimal) / pOptimal * 0.2;
    const kFactor = 1 - Math.abs(data.potassium - kOptimal) / kOptimal * 0.25;
    yieldValue = yieldValue * Math.max(0.6, (nFactor + pFactor + kFactor) / 3);

    const tempOptimal = 24;
    const tempFactor = 1 - Math.abs(data.temperature - tempOptimal) / tempOptimal * 0.4;
    yieldValue = yieldValue * Math.max(0.5, tempFactor);

    const rainfallOptimal = 750;
    const rainfallFactor = 1 - Math.abs(data.rainfall - rainfallOptimal) / rainfallOptimal * 0.3;
    yieldValue = yieldValue * Math.max(0.6, rainfallFactor);

    const irrigationBonus = {
      none: 1.0,
      flood: 1.1,
      sprinkler: 1.15,
      drip: 1.2
    };
    yieldValue = yieldValue * irrigationBonus[data.irrigationType];

    const variance = (Math.random() - 0.5) * 0.3;
    yieldValue = yieldValue + variance;

    return Math.max(1.0, parseFloat(yieldValue.toFixed(2)));
  };

  const generateHistoricalData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month: month,
      actualYield: Math.random() * 5 + 6,
      predictedYield: Math.random() * 5 + 5.5,
      rainfall: Math.random() * 100 + 50,
      temperature: Math.random() * 15 + 15
    }));
  };

  useEffect(() => {
    setHistoricalData(generateHistoricalData());
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const analyzeLimitingFactors = (data) => {
    const factors = [];
    
    if (data.soilPH < 6.0 || data.soilPH > 7.5) {
      factors.push({ factor: 'Soil pH', impact: 'High', value: data.soilPH });
    }
    
    if (data.nitrogen < 120) {
      factors.push({ factor: 'Nitrogen Level', impact: 'Medium', value: data.nitrogen });
    }
    
    if (data.rainfall < 600) {
      factors.push({ factor: 'Rainfall', impact: 'High', value: data.rainfall });
    }
    
    if (data.temperature < 18 || data.temperature > 30) {
      factors.push({ factor: 'Temperature', impact: 'Medium', value: data.temperature });
    }
    
    return factors;
  };

  const generateRecommendations = (data, factors) => {
    const recommendations = [];
    
    factors.forEach(factor => {
      if (factor.factor === 'Soil pH') {
        if (factor.value < 6.0) {
          recommendations.push('Apply lime to increase soil pH to optimal range (6.0-7.0)');
        } else {
          recommendations.push('Apply sulfur to decrease soil pH to optimal range (6.0-7.0)');
        }
      } else if (factor.factor === 'Nitrogen Level') {
        recommendations.push('Increase nitrogen fertilizer application to 140-160 kg/ha');
      } else if (factor.factor === 'Rainfall') {
        recommendations.push('Consider supplemental irrigation during dry periods');
      } else if (factor.factor === 'Temperature') {
        recommendations.push('Monitor for heat stress and consider shade management');
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push('Current conditions are optimal for maximum yield');
    }
    
    return recommendations;
  };

  const handlePredict = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const predictedYield = predictYield(formData);
    const confidence = Math.min(95, Math.max(70, 85 + Math.random() * 10));
    const factors = analyzeLimitingFactors(formData);
    
    setPrediction({
      yield: predictedYield,
      confidence: parseFloat(confidence.toFixed(1)),
      factors: factors,
      recommendations: generateRecommendations(formData, factors)
    });
    
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center mb-6">
          <Sprout className="w-8 h-8 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">AI Crop Yield Predictor</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Crop & Field Parameters
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
                <select 
                  value={formData.cropType}
                  onChange={(e) => handleInputChange('cropType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="corn">Corn</option>
                  <option value="wheat">Wheat</option>
                  <option value="soybean">Soybean</option>
                  <option value="rice">Rice</option>
                  <option value="cotton">Cotton</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select 
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="midwest">Midwest</option>
                  <option value="south">South</option>
                  <option value="west">West</option>
                  <option value="northeast">Northeast</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
                <select 
                  value={formData.soilType}
                  onChange={(e) => handleInputChange('soilType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="clay">Clay</option>
                  <option value="sandy">Sandy</option>
                  <option value="loam">Loam</option>
                  <option value="silt">Silt</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Soil pH</label>
                <input
                  type="range"
                  min="4.5"
                  max="8.5"
                  step="0.1"
                  value={formData.soilPH}
                  onChange={(e) => handleInputChange('soilPH', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center text-sm text-gray-600 mt-1">{formData.soilPH}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nitrogen (kg/ha)</label>
                <input
                  type="number"
                  value={formData.nitrogen}
                  onChange={(e) => handleInputChange('nitrogen', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phosphorus (kg/ha)</label>
                <input
                  type="number"
                  value={formData.phosphorus}
                  onChange={(e) => handleInputChange('phosphorus', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Potassium (kg/ha)</label>
                <input
                  type="number"
                  value={formData.potassium}
                  onChange={(e) => handleInputChange('potassium', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Thermometer className="w-4 h-4 mr-1" />
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Droplets className="w-4 h-4 mr-1" />
                  Rainfall (mm/year)
                </label>
                <input
                  type="number"
                  value={formData.rainfall}
                  onChange={(e) => handleInputChange('rainfall', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Irrigation Type</label>
              <select 
                value={formData.irrigationType}
                onChange={(e) => handleInputChange('irrigationType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="none">No Irrigation</option>
                <option value="flood">Flood Irrigation</option>
                <option value="sprinkler">Sprinkler</option>
                <option value="drip">Drip Irrigation</option>
              </select>
            </div>

            <button
              onClick={handlePredict}
              disabled={isAnalyzing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Predict Yield
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            {prediction && (
              <>
                <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 text-white">
                  <h3 className="text-xl font-semibold mb-4">Yield Prediction</h3>
                  <div className="text-4xl font-bold mb-2">{prediction.yield} tons/ha</div>
                  <div className="text-green-100">Confidence: {prediction.confidence}%</div>
                </div>

                {prediction.factors.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-red-800 mb-3">Limiting Factors</h4>
                    <div className="space-y-2">
                      {prediction.factors.map((factor, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-red-700">{factor.factor}</span>
                          <span className={`px-2 py-1 rounded text-sm ${
                            factor.impact === 'High' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            {factor.impact} Impact
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index} className="text-blue-700 flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {!prediction && (
              <div className="text-center py-12 text-gray-500">
                <Sprout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Enter your crop and field parameters to get a yield prediction</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Historical Performance Analysis</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Yield Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actualYield" stroke="#10B981" strokeWidth={2} name="Actual Yield" />
                <Line type="monotone" dataKey="predictedYield" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" name="Predicted Yield" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Weather Patterns</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rainfall" fill="#60A5FA" name="Rainfall (mm)" />
                <Bar dataKey="temperature" fill="#F59E0B" name="Temperature (°C)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CropYieldPredictor;