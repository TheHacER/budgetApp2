const ForecastService = require('../services/forecastService');

class ForecastController {
  static async getCashflowForecast(req, res) {
    try {
      const forecast = await ForecastService.generateForecast();
      res.status(200).json(forecast);
    } catch (error) {
      console.error('Error generating cashflow forecast:', error);
      res.status(500).json({ message: 'Server error generating cashflow forecast.' });
    }
  }
}

module.exports = ForecastController;
