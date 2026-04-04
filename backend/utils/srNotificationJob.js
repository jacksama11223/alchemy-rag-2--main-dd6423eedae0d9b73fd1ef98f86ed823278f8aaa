const cron = require('node-cron');
const User = require('../models/User');
const Node = require('../models/Node');
const { sendPushNotification } = require('./pushNotifications');

/**
 * Scheduled job to check for due items and notify users
 * Runs every day at 9:00 AM
 */
const initSRNotificationJob = () => {
    // 0 9 * * * = 9:00 AM daily
    // For testing, you can use '* * * * *' to run every minute
    cron.schedule('0 9 * * *', async () => {
        console.log('Running Spaced Repetition Notification Job...');
        
        try {
            const users = await User.find({ pushTokens: { $exists: true, $not: { $size: 0 } } });
            
            for (const user of users) {
                const nodes = await Node.find({ user: user._id });
                const now = new Date();
                const todayStart = new Date(now.setHours(0,0,0,0)).getTime();
                
                let dueCount = 0;
                
                nodes.forEach(node => {
                    if (!node.data) return;
                    const allItems = [
                        ...(node.data.flashcards || []),
                        ...(node.data.quiz || []),
                        ...(node.data.fillInBlanks || []),
                        ...(node.data.spotErrors || []),
                        ...(node.data.caseStudies || [])
                    ];
                    
                    allItems.forEach(item => {
                        if (item && item.sm2 && item.sm2.nextReviewDate) {
                            const reviewDate = new Date(item.sm2.nextReviewDate).getTime();
                            if (reviewDate <= todayStart) {
                                dueCount++;
                            }
                        }
                    });
                });
                
                if (dueCount > 0) {
                    console.log(`User ${user.email} has ${dueCount} items due. Sending notification...`);
                    await sendPushNotification(user, {
                        title: '📚 Lịch ôn tập hôm nay',
                        body: `Bạn có ${dueCount} mục kiến thức cần ôn tập để ghi nhớ lâu hơn. Hãy mở Explore Graph nhé!`,
                        data: { type: 'sr_reminder', count: dueCount }
                    });
                }
            }
        } catch (error) {
            console.error('Error in SR Notification Job:', error);
        }
    });
    
    console.log('Spaced Repetition Notification Job initialized.');
};

module.exports = { initSRNotificationJob };
