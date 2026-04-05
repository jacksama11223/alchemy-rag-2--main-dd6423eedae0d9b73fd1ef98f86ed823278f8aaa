const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const FeedbackItem = require('../models/FeedbackItem');
const User = require('../models/User');

const startImapListener = async (io) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('IMAP Listener: Missing credentials. Skipping initialization.');
        return;
    }

    const client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        logger: false
    });

    const run = async () => {
        // Wait until client connects and authorizes
        await client.connect();

        // Select All Mail if possible, otherwise INBOX
        const mailboxes = await client.list();
        const allMailFolder = mailboxes.find(m => m.path.includes('All Mail') || m.specialUse === '\\All') || { path: 'INBOX' };
        const sentFolder = mailboxes.find(m => m.path.includes('Sent') || m.specialUse === '\\Sent') || { path: 'INBOX' };
        
        console.log(`IMAP Listener: Monitoring folders: INBOX and ${sentFolder.path}`);

        const setupListener = async (mailboxPath) => {
            let lock = await client.getMailboxLock(mailboxPath);
            try {
                client.on('exists', async (data) => {
                    const count = data.count;
                    let message = await client.fetchOne(count, { source: true });
                    let parsed = await simpleParser(message.source);

                    const subject = parsed.subject || '';
                    const body = parsed.text || '';
                    const from = parsed.from?.value[0]?.address || '';

                    // Check for FID tag in subject or body
                    const fidMatch = subject.match(/\[FID: ([a-f\d]{24})\]/) || body.match(/\[FID: ([a-f\d]{24})\]/);
                    
                    if (fidMatch) {
                        const feedbackId = fidMatch[1];
                        console.log(`IMAP Listener: Processing mail with FID ${feedbackId} from ${from}`);

                        // Only process if it's from admin
                        if (from.toLowerCase() !== process.env.EMAIL_USER.toLowerCase()) return;

                        // Clean reply
                        const cleanReply = body.split(/On .* wrote:|--- Original Message ---/i)[0].trim();

                        try {
                            const feedback = await FeedbackItem.findById(feedbackId).populate('user');
                            if (feedback && (feedback.reply !== cleanReply)) {
                                feedback.status = 'Resolved';
                                feedback.reply = cleanReply;
                                await feedback.save();

                                if (io && feedback.user) {
                                    io.to(feedback.user._id.toString()).emit('feedback_updated', {
                                        status: 'Resolved',
                                        reply: cleanReply,
                                        timestamp: new Date()
                                    });

                                    // ADD PERSISTENT NOTIFICATION FOR THE CENTER
                                    try {
                                        const user = await User.findById(feedback.user);
                                        if (user) {
                                            const newNotif = {
                                                type: 'info',
                                                message: `Admin LearnAI đã phản hồi yêu cầu của bạn (qua Email): "${cleanReply.substring(0, 50)}..."`,
                                                read: false,
                                                createdAt: new Date()
                                            };
                                            user.notifications.push(newNotif);
                                            await user.save();
                                            
                                            // Emit standard notification event for TopBar/Badge
                                            const latestNotif = user.notifications[user.notifications.length - 1];
                                            io.to(user._id.toString()).emit('new_notification', latestNotif);
                                            console.log(`IMAP Listener: Persistent notification created and emitted for user ${user._id}`);
                                        }
                                    } catch (notifErr) {
                                        console.error('IMAP Listener: Failed to create persistence notification:', notifErr.message);
                                    }
                                }
                            }
                        } catch (err) {
                            console.error(`IMAP Listener Error processing feedback ${feedbackId}:`, err.message);
                        }
                    }
                });
            } finally {
                lock.release();
            }
        };

        await setupListener('INBOX');
        await setupListener(sentFolder.path);
    };

    run().catch(err => {
        console.error('IMAP Listener Error:', err.message);
        // Attempt to reconnect after a delay
        setTimeout(() => startImapListener(io), 30000);
    });
};

module.exports = { startImapListener };
