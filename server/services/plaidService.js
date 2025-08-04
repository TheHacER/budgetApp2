const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

class PlaidService {
  constructor() {
    const env = process.env.PLAID_ENV || 'sandbox';
    const configuration = new Configuration({
      basePath: PlaidEnvironments[env],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });
    this.client = new PlaidApi(configuration);
  }

  async getTransactions(accessToken, startDate, endDate) {
    const response = await this.client.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: { count: 500, offset: 0 },
    });
    return response.data.transactions;
  }
}

module.exports = new PlaidService();
