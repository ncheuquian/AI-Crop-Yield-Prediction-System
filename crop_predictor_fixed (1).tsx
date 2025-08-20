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
      cotton: 2.1,
      melon: 35.0,
      pumpkin: 22.0,
      cilantro: 1.8
    };

    let yieldValue = baseYield[data.cropType] || 8.0;

    const soilMultiplier = {
      clay: 0.95,
      sandy: 0.85,
      loam: 1.0,
      silt: 0.92
    };
    
    // Crop-specific soil preferences
    if (data.cropType === 'melon' || data.cropType === 'pumpkin') {
      // Melons and pumpkins prefer well-draining sandy loam
      soilMultiplier.sandy = 1.05;
      soilMultiplier.loam = 1.0;
      soilMultiplier.clay = 0.8;
    } else if (data.cropType === 'cilantro') {
      // Cilantro prefers loam to clay loam
      soilMultiplier.loam = 1.0;
      soilMultiplier.clay = 0.98;
      soilMultiplier.sandy = 0.9;
    }
    
    yieldValue = yieldValue * soilMultiplier[data.soilType];

    // Crop-specific pH optimization
    let phOptimal = 6.5;
    if (data.cropType === 'melon') {
      phOptimal = 6.8; // Melons prefer slightly alkaline soil
    } else if (data.cropType === 'pumpkin') {
      phOptimal = 6.5; // Pumpkins are more flexible
    } else if (data.cropType === 'cilantro') {
      phOptimal = 6.2; // Cilantro prefers slightly acidic to neutral
    }
    
    const phDifference = Math.abs(data.soilPH - phOptimal);
    yieldValue = yieldValue * Math.max(0.7, 1 - (phDifference * 0.1));

    // Crop-specific nutrient requirements
    let nOptimal = 160;
    let pOptimal = 65;
    let kOptimal = 130;
    
    if (data.cropType === 'melon') {
      nOptimal = 120; // Melons need moderate nitrogen
      pOptimal = 80;  // Higher phosphorus for fruit development
      kOptimal = 200; // High potassium for fruit quality
    } else if (data.cropType === 'pumpkin') {
      nOptimal = 140; // Pumpkins need good nitrogen for vine growth
      pOptimal = 90;  // High phosphorus for large fruit
      kOptimal = 180; // Good potassium for fruit development
    } else if (data.cropType === 'cilantro') {
      nOptimal = 100; // Cilantro needs moderate nitrogen
      pOptimal = 40;  // Lower phosphorus requirement
      kOptimal = 80;  // Moderate potassium
    }
    
    const nFactor = 1 - Math.abs(data.nitrogen - nOptimal) / nOptimal * 0.3;
    const pFactor = 1 - Math.abs(data.phosphorus - pOptimal) / pOptimal * 0.2;
    const kFactor = 1 - Math.abs(data.potassium - kOptimal) / kOptimal * 0.25;
    yieldValue = yieldValue * Math.max(0.6, (nFactor + pFactor + kFactor) / 3);

    // Crop-specific temperature optimization
    let tempOptimal = 24;
    if (data.cropType === 'melon') {
      tempOptimal = 27; // Melons prefer warmer temperatures
    } else if (data.cropType === 'pumpkin') {
      tempOptimal = 24; // Pumpkins like moderate warmth
    } else if (data.cropType === 'cilantro') {
      tempOptimal = 18; // Cilantro prefers cooler weather
    }
    
    const tempFactor = 1 - Math.abs(data.temperature - tempOptimal) / tempOptimal * 0.4;
    yieldValue = yieldValue * Math.max(0.5, tempFactor);

    // Crop-specific rainfall optimization
    let rainfallOptimal = 750;
    if (data.cropType === 'melon') {
      rainfallOptimal = 600; // Melons need less water, prefer drier conditions
    } else if (data.cropType === 'pumpkin') {
      rainfallOptimal = 800; // Pumpkins need consistent moisture
    } else if (data.cropType === 'cilantro') {
      rainfallOptimal = 500; // Cilantro prefers moderate moisture
    }
    
    const rainfallFactor = 1 - Math.abs(data.rainfall - rainfallOptimal) / rainfallOptimal * 0.3;
    yieldValue = yieldValue * Math.max(0.6, rainfallFactor);

    const irrigationBonus = {
      none: 1.0,
      flood: 1.1,
      sprinkler: 1.15,
      drip: 1.2
    };
    
    // Crop-specific irrigation preferences
    if (data.cropType === 'melon') {
      // Melons benefit greatly from drip irrigation
      irrigationBonus.drip = 1.25;
      irrigationBonus.flood = 0.95; // Don't like wet feet
    } else if (data.cropType === 'pumpkin') {
      // Pumpkins like consistent moisture
      irrigationBonus.drip = 1.2;
      irrigationBonus.sprinkler = 1.18;
    } else if (data.cropType === 'cilantro') {
      // Cilantro prefers gentle, consistent watering
      irrigationBonus.drip = 1.15;
      irrigationBonus.sprinkler = 1.12;
      irrigationBonus.flood = 0.9; // Too much water causes issues
    }
    
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
    
    // Crop-specific pH requirements
    let phMin = 6.0;
    let phMax = 7.5;
    if (data.cropType === 'melon') {
      phMin = 6.3;
      phMax = 7.2;
    } else if (data.cropType === 'pumpkin') {
      phMin = 6.0;
      phMax = 7.0;
    } else if (data.cropType === 'cilantro') {
      phMin = 5.8;
      phMax = 6.8;
    }
    
    if (data.soilPH < phMin || data.soilPH > phMax) {
      factors.push({ factor: 'Soil pH', impact: 'High', value: data.soilPH });
    }
    
    // Crop-specific nitrogen requirements
    let nMin = 120;
    if (data.cropType === 'melon') {
      nMin = 100;
    } else if (data.cropType === 'pumpkin') {
      nMin = 120;
    } else if (data.cropType === 'cilantro') {
      nMin = 80;
    }
    
    if (data.nitrogen < nMin) {
      factors.push({ factor: 'Nitrogen Level', impact: 'Medium', value: data.nitrogen });
    }
    
    // Crop-specific rainfall requirements
    let rainfallMin = 600;
    if (data.cropType === 'melon') {
      rainfallMin = 400;
    } else if (data.cropType === 'pumpkin') {
      rainfallMin = 650;
    } else if (data.cropType === 'cilantro') {
      rainfallMin = 350;
    }
    
    if (data.rainfall < rainfallMin) {
      factors.push({ factor: 'Rainfall', impact: 'High', value: data.rainfall });
    }
    
    // Crop-specific temperature requirements
    let tempMin = 18;
    let tempMax = 30;
    if (data.cropType === 'melon') {
      tempMin = 22;
      tempMax = 35;
    } else if (data.cropType === 'pumpkin') {
      tempMin = 18;
      tempMax = 32;
    } else if (data.cropType === 'cilantro') {
      tempMin = 12;
      tempMax = 25;
    }
    
    if (data.temperature < tempMin || data.temperature > tempMax) {
      factors.push({ factor: 'Temperature', impact: 'Medium', value: data.temperature });
    }
    
    // Special considerations for new crops
    if (data.cropType === 'cilantro' && data.temperature > 22) {
      factors.push({ factor: 'Heat Stress Risk', impact: 'High', value: data.temperature });
    }
    
    if ((data.cropType === 'melon' || data.cropType === 'pumpkin') && data.soilType === 'clay') {
      factors.push({ factor: 'Soil Drainage', impact: 'Medium', value: 'Poor drainage in clay soil' });
    }
    
    return factors;
  };

  const generateRecommendations = (data, factors) => {
    const recommendations = [];
    
    factors.forEach(factor => {
      if (factor.factor === 'Soil pH') {
        if (data.cropType === 'melon') {
          if (factor.value < 6.3) {
            recommendations.push('Apply lime to increase soil pH to 6.3-7.2 for optimal melon growth');
          } else {
            recommendations.push('Apply sulfur to decrease soil pH to 6.3-7.2 range for melons');
          }
        } else if (data.cropType === 'pumpkin') {
          if (factor.value < 6.0) {
            recommendations.push('Apply lime to increase soil pH to 6.0-7.0 for pumpkin cultivation');
          } else {
            recommendations.push('Apply sulfur to decrease soil pH to 6.0-7.0 range for pumpkins');
          }
        } else if (data.cropType === 'cilantro') {
          if (factor.value < 5.8) {
            recommendations.push('Apply lime to increase soil pH to 5.8-6.8 for cilantro production');
          } else {
            recommendations.push('Apply sulfur to decrease soil pH to 5.8-6.8 range for cilantro');
          }
        } else {
          if (factor.value < 6.0) {
            recommendations.push('Apply lime to increase soil pH to optimal range (6.0-7.0)');
          } else {
            recommendations.push('Apply sulfur to decrease soil pH to optimal range (6.0-7.0)');
          }
        }
      } else if (factor.factor === 'Nitrogen Level') {
        if (data.cropType === 'melon') {
          recommendations.push('Increase nitrogen application to 100-120 kg/ha for melon production');
        } else if (data.cropType === 'pumpkin') {
          recommendations.push('Increase nitrogen application to 120-140 kg/ha for pumpkin vine development');
        } else if (data.cropType === 'cilantro') {
          recommendations.push('Increase nitrogen application to 80-100 kg/ha for cilantro leaf production');
        } else {
          recommendations.push('Increase nitrogen fertilizer application to 140-160 kg/ha');
        }
      } else if (factor.factor === 'Rainfall') {
        if (data.cropType === 'melon') {
          recommendations.push('Implement drip irrigation - melons prefer controlled watering (400-600mm annually)');
        } else if (data.cropType === 'pumpkin') {
          recommendations.push('Ensure consistent moisture through irrigation - pumpkins need 650-800mm annually');
        } else if (data.cropType === 'cilantro') {
          recommendations.push('Provide gentle, consistent irrigation - cilantro needs 350-500mm annually');
        } else {
          recommendations.push('Consider supplemental irrigation during dry periods');
        }
      } else if (factor.factor === 'Temperature') {
        if (data.cropType === 'melon') {
          recommendations.push('Melons prefer warm conditions (22-35°C) - consider greenhouse or season timing');
        } else if (data.cropType === 'pumpkin') {
          recommendations.push('Adjust planting time for optimal temperature range (18-32°C) for pumpkins');
        } else if (data.cropType === 'cilantro') {
          recommendations.push('Cilantro prefers cool weather (12-25°C) - plant in fall/winter or provide shade');
        } else {
          recommendations.push('Monitor for heat stress and consider shade management');
        }
      } else if (factor.factor === 'Heat Stress Risk') {
        recommendations.push('Plant cilantro in partial shade or during cooler months to prevent bolting');
      } else if (factor.factor === 'Soil Drainage') {
        recommendations.push('Improve soil drainage with raised beds or organic matter - melons/pumpkins need well-draining soil');
      }
    });
    
    // Crop-specific general recommendations
    if (recommendations.length === 0) {
      if (data.cropType === 'melon') {
        recommendations.push('Conditions are good for melons - ensure consistent drip irrigation and warm temperatures');
      } else if (data.cropType === 'pumpkin') {
        recommendations.push('Conditions are optimal for pumpkins - maintain consistent moisture and monitor for pests');
      } else if (data.cropType === 'cilantro') {
        recommendations.push('Conditions are excellent for cilantro - harvest before bolting in warm weather');
      } else {
        recommendations.push('Current conditions are optimal for maximum yield');
      }
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
                  <option value="melon">Melon</option>
                  <option value="pumpkin">Pumpkin</option>
                  <option value="cilantro">Cilantro</option>
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