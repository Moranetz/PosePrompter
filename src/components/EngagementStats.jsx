import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Copy, Sparkles, Award, Calendar, X, Trophy } from 'lucide-react';
import { getUserEngagementStats, ACHIEVEMENTS } from '../utils/engagementService';

/**
 * EngagementStats - Subtle progress indicator
 * 
 * Shows user their progress in a non-intrusive way.
 * Ethical: Users can see their stats, but it doesn't dominate the UI.
 */

const EngagementStats = ({ userId, isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      loadStats();
    }
  }, [isOpen, userId]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getUserEngagementStats(userId);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const userStats = stats?.stats || {};
  const achievements = stats?.achievements || { unlocked: [] };
  
  // Map unlocked achievement IDs to their full data
  const unlockedAchievementsList = (achievements.unlocked || []).map(achievementId => {
    // Find the achievement in ACHIEVEMENTS by ID
    for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
      if (achievement.id === achievementId) {
        return achievement;
      }
    }
    return null;
  }).filter(Boolean); // Remove any null entries

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="engagement-stats-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              position: 'relative',
            }}
          >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
            }}
          >
            <X size={20} />
          </button>

          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            margin: 0,
            marginBottom: '24px',
          }}>
            Your Progress
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
              Loading...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
              }}>
                <StatCard
                  icon={<Copy size={20} />}
                  label="Prompts Generated"
                  value={userStats.promptsGenerated || 0}
                  color="#22c55e"
                />
                <StatCard
                  icon={<Copy size={20} />}
                  label="Prompts Copied"
                  value={userStats.promptsCopied || 0}
                  color="#3b82f6"
                />
                <StatCard
                  icon={<Calendar size={20} />}
                  label="Current Streak"
                  value={`${userStats.currentStreak || 0} days`}
                  color="#f59e0b"
                />
                <StatCard
                  icon={<Award size={20} />}
                  label="Achievements"
                  value={`${achievements.unlocked?.length || 0} unlocked`}
                  color="#8b5cf6"
                />
              </div>

              {/* Longest Streak */}
              {userStats.longestStreak > 0 && (
                <div style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <TrendingUp size={24} color="#fbbf24" />
                  <div>
                    <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                      Longest Streak
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#fbbf24' }}>
                      {userStats.longestStreak} days
                    </div>
                  </div>
                </div>
              )}

              {/* Unlocked Achievements */}
              {unlockedAchievementsList.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Unlocked Achievements
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {unlockedAchievementsList.map((achievement) => (
                      <div key={achievement.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.2)',
                        borderRadius: '8px',
                      }}>
                        <Trophy size={20} color="#fbbf24" />
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>
                            {achievement.name}
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                            {achievement.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Categories */}
              {userStats.favoriteCategories && Object.keys(userStats.favoriteCategories).length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Most Explored Categories
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(userStats.favoriteCategories)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([category, count]) => (
                        <div key={category} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                        }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                            {category}
                          </span>
                          <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px' }}>
                            {count} times
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }}>
    <div style={{ color, display: 'flex', alignItems: 'center' }}>
      {icon}
    </div>
    <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
      {value}
    </div>
    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
      {label}
    </div>
  </div>
);

export default EngagementStats;

