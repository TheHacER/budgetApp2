const eomService = require('../services/eomService');

exports.getEomStatus = async (req, res) => {
    try {
        const status = await eomService.getEomStatusForMonth();
        res.json(status);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching EOM status', error: error.message });
    }
};

// This single function now handles the entire EOM process securely on the server.
exports.runEomProcess = async (req, res) => {
    const { monthId } = req.params;
    if (!monthId) {
        return res.status(400).json({ message: 'Financial month ID is required.' });
    }

    console.log(`Starting EOM process for month ID: ${monthId}`);
    const results = [];
    let overallSuccess = true;

    try {
        // Step 1: Process Recurring Bills
        const step1Result = await eomService.processRecurringBillsForMonth(monthId);
        results.push({ name: 'Process Recurring Bills', success: true, data: step1Result });

        // Step 2: Process Planned Income
        const step2Result = await eomService.processPlannedIncomeForMonth(monthId);
        results.push({ name: 'Process Planned Income', success: true, data: step2Result });

        // Step 3: Calculate Savings Contributions
        const step3Result = await eomService.calculateSavingsContributions(monthId);
        results.push({ name: 'Calculate Savings Contributions', success: true, data: step3Result });

        // Step 4: Finalize Month End
        const step4Result = await eomService.finalizeMonthEnd(monthId);
        results.push({ name: 'Finalize Month End', success: true, data: step4Result });

        res.status(200).json({
            message: 'End of Month process completed successfully.',
            results: results
        });

    } catch (error) {
        console.error(`EOM process failed for month ID ${monthId}:`, error);
        overallSuccess = false;
        results.push({ name: 'Process Failed', success: false, error: error.message });
        res.status(500).json({
            message: 'End of Month process failed.',
            error: error.message,
            results: results
        });
    }
};