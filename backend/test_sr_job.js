
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Node = require('./models/Node');
const { sendPushNotification } = require('./utils/pushNotifications');

dotenv.config();

const testJob = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alchemy-rag');
        console.log('Connected to MongoDB');

        const users = await User.find({ pushTokens: { $exists: true, $not: { $size: 0 } } });
        console.log(`Found ${users.length} users with push tokens.`);

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
                        if (reviewDate <= todayStart) dueCount++;
                    }
                });
            });

            if (dueCount > 0) {
                console.log(`User ${user.email} has ${dueCount} items due. Sending TEST notification...`);
                await sendPushNotification(user, {
                    title: '🧪 TEST: Lịch ôn tập hôm nay',
                    body: `Bạn có ${dueCount} mục kiến thức cần ôn tập. (Đây là thông báo thử nghiệm)`,
                    data: { type: 'sr_reminder', count: dueCount }
                });
            } else {
                console.log(`User ${user.email} has no due items.`);
            }
        }

        console.log('Test complete. Closing connection.');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Test failed:', error);
    }
};

testJob();
