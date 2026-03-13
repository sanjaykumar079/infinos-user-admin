import axios from 'axios';

const CHANNEL_ID = '3297681';
const API_KEY = 'C8DUVRKN6XZTK1A2';  // Ask team if this is READ key or WRITE key

const thingspeakAPI = axios.create({
  baseURL: 'https://api.thingspeak.com',
  timeout: 10000,
});

export const thingspeakService = {
  // Get latest reading (last 1 entry)
  async getLatestReading() {
    try {
      const response = await thingspeakAPI.get(`/channels/${CHANNEL_ID}/feeds.json`, {
        params: {
          api_key: API_KEY,
          results: 1,  // just the latest
        }
      });

      const feed = response.data.feeds[0];
      if (!feed) return null;

      return {
        timestamp: feed.created_at,
        hotTemp: parseFloat(feed.field1),
        hotHumidity: parseFloat(feed.field2),
        coldTemp: parseFloat(feed.field3),
        coldHumidity: parseFloat(feed.field4),
        batteryLevel: parseFloat(feed.field5),
        batteryVoltage: parseFloat(feed.field6),
      };
    } catch (error) {
      console.error('ThingSpeak fetch error:', error);
      return null;
    }
  },

  // Get last N readings for charts
  async getHistory(count = 20) {
    try {
      const response = await thingspeakAPI.get(`/channels/${CHANNEL_ID}/feeds.json`, {
        params: {
          api_key: API_KEY,
          results: count,
        }
      });

      return response.data.feeds.map(feed => ({
        timestamp: feed.created_at,
        hotTemp: parseFloat(feed.field1),
        hotHumidity: parseFloat(feed.field2),
        coldTemp: parseFloat(feed.field3),
        coldHumidity: parseFloat(feed.field4),
        batteryLevel: parseFloat(feed.field5),
        batteryVoltage: parseFloat(feed.field6),
      }));
    } catch (error) {
      console.error('ThingSpeak history fetch error:', error);
      return [];
    }
  },

  // Get channel info (metadata)
  async getChannelInfo() {
    try {
      const response = await thingspeakAPI.get(`/channels/${CHANNEL_ID}/feeds.json`, {
        params: {
          api_key: API_KEY,
          results: 0,  // just metadata, no feeds
        }
      });

      return {
        name: response.data.channel.name,
        description: response.data.channel.description,
        lastUpdate: response.data.channel.updated_at,
      };
    } catch (error) {
      console.error('ThingSpeak channel info error:', error);
      return null;
    }
  }
};