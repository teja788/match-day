/**
 * Notification Service — placeholder for Web Push API integration
 *
 * To enable browser push notifications:
 * 1. Set up Firebase Cloud Messaging (FCM)
 * 2. Generate VAPID keys
 * 3. Implement subscription endpoint
 * 4. Send push on goals/wickets
 *
 * This is a Phase 2 feature — implement after core site is live.
 */

async function sendPushNotification(subscription, payload) {
  // TODO: Implement with web-push library
  console.log('[Notifications] Push notification queued:', payload.title);
}

async function notifyGoal(match, team) {
  const payload = {
    title: `⚽ GOAL! ${team.name}`,
    body: `${match.teamA.shortName} ${match.teamA.score} - ${match.teamB.score} ${match.teamB.shortName}`,
    icon: team.logo,
    url: `/match/${match.id}`,
  };
  // TODO: Send to all subscribers watching this match
  console.log('[Notifications]', payload.title);
}

async function notifyWicket(match, team) {
  const payload = {
    title: `🏏 WICKET! ${team.name}`,
    body: `${match.teamA.shortName} ${match.teamA.score} vs ${match.teamB.shortName}`,
    icon: team.logo,
    url: `/match/${match.id}`,
  };
  console.log('[Notifications]', payload.title);
}

module.exports = { sendPushNotification, notifyGoal, notifyWicket };
