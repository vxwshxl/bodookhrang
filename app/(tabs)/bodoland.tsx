import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ACCESS_TOKEN = 'IGAATQviOVImhBZAFNlTjZAXWHluWk5RRk02RmJfenRwNDdPM0ZAaN214S1h1Vm9FUEhhMVZArQ1RaR1VKaDRYdUU5SlZAfM3FPUWdZAZAU1fdGtCOEVkeUtQVk4tQS1HSXF6dE52ZAkZADemRFOFR1ZAF9ZAVFEwQWRUVzRwYUs3VmhpYUZAudwZDZD';

const VideoPlayer = ({ uri, isVisible }) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = false;
  });

  const videoRef = useRef(null);

  useEffect(() => {
    if (isVisible) player.play();
    else player.pause();
  }, [isVisible]);

  return (
    <View style={{ width: '100%', backgroundColor: '#000' }}>
      <VideoView
        ref={videoRef}
        player={player}
        style={{
          width: '100%',
          aspectRatio: 1, // or 9/16 for portrait videos
        }}
        contentFit="cover"
        nativeControls // 👈 Always enabled — no flicker
      />
    </View>
  );
};

const CarouselMedia = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const firstVisible = viewableItems[0].item;
      if (firstVisible.media_type === 'VIDEO') {
        setVisibleVideoIndex(viewableItems[0].index);
      } else {
        setVisibleVideoIndex(null);
      }
    }
  }).current;
  
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;  

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={children}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.media_url }}
            style={[styles.media, { width: SCREEN_WIDTH }]}
            resizeMode="cover"
          />
        )}
      />
      <View style={styles.carouselIndicator}>
        <Ionicons name="copy-outline" size={20} color="white" />
        <Text style={styles.carouselText}>
          {currentIndex + 1}/{children.length}
        </Text>
      </View>
    </View>
  );
};

const InstagramProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [postsData, setPostsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBio, setShowBio] = useState(false);
  const [visibleVideoIndex, setVisibleVideoIndex] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchProfileData();
    fetchPostsData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,profile_picture_url,username,name,media_count,followers_count,account_type,biography,website&access_token=${ACCESS_TOKEN}`
      );
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPostsData = async () => {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,media_type,media_url,children{media_url},caption,permalink,timestamp&access_token=${ACCESS_TOKEN}`
      );
      const data = await response.json();
      setPostsData(data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const formatFollowers = (count) => {
    if (!count) return '0';
    if (count < 10000) return count.toLocaleString();
    if (count < 1000000) return `${(count / 1000).toFixed(1).replace('.0', '')}K`;
    return `${(count / 1000000).toFixed(1).replace('.0', '')}M`;
  };

  const formatTimestamp = (timestamp) => {
    const postDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;

    return postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatCaption = (caption) => {
    if (!caption) return null;

    const parts = caption.split(/(#\w+)/g);
    
    return (
      <Text style={styles.caption}>
        {parts.map((part, index) => {
          if (part.startsWith('#')) {
            return (
              <Text key={index} style={styles.hashtag}>
                {part}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  const handleShare = async (url) => {
    try {
      await Share.share({
        message: url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const onScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    
    postsData.forEach((post, index) => {
      if (post.media_type === 'VIDEO') {
        const postOffset = index * (SCREEN_WIDTH + 200);
        if (scrollY >= postOffset - 200 && scrollY <= postOffset + SCREEN_WIDTH) {
          setVisibleVideoIndex(index);
        }
      }
    });
  };

  const renderMedia = (post, index) => {
    if (post.media_type === 'VIDEO') {
      return (
        <VideoPlayer 
          uri={post.media_url} 
          isVisible={visibleVideoIndex === index}
        />
      );
    } else if (post.media_type === 'CAROUSEL_ALBUM' && post.children?.data) {
      return <CarouselMedia children={post.children.data} />;
    } else {
      const [imgHeight, setImgHeight] = useState(SCREEN_WIDTH); // default fallback
  
      useEffect(() => {
        Image.getSize(post.media_url, (w, h) => {
          const ratio = h / w;
          setImgHeight(SCREEN_WIDTH * ratio);
        });
      }, [post.media_url]);
  
      return (
        <Image
          source={{ uri: post.media_url }}
          style={{ width: SCREEN_WIDTH, height: imgHeight, backgroundColor: '#000' }}
          resizeMode="cover"
        />
      );
    }
  };  

  if (loading || !profileData) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#0095f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft}>
          <Text style={styles.headerUsername}>{profileData.username}</Text>
          <Ionicons name="chevron-down" size={16} color="#fff" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <Image
              source={{ uri: profileData.profile_picture_url }}
              style={styles.profilePic}
            />
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{profileData.media_count}</Text>
                <Text style={styles.statLabel}>posts</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {formatFollowers(profileData.followers_count)}
                </Text>
                <Text style={styles.statLabel}>followers</Text>
              </View>
            </View>
          </View>

          {/* Name */}
          <Text style={styles.profileName}>{profileData.name || profileData.username}</Text>

          {/* Category and Bio Toggle */}
          <View style={styles.categoryRow}>
            <Text style={styles.category}>{profileData.category || 'Media/news company'}</Text>
            <TouchableOpacity onPress={() => setShowBio(!showBio)}>
              <Ionicons 
                name={showBio ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>

          {showBio && (
            <View style={styles.bioSection}>
              <Text style={styles.bioText}>{profileData.biography}</Text>
              {profileData.website && (
                <TouchableOpacity onPress={() => Linking.openURL(profileData.website)}>
                  <Text style={styles.websiteLink}>{profileData.website}</Text>
                </TouchableOpacity>
              )}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.followButton}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Email</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Posts Grid */}
        <View style={styles.postsSection}>
          {postsData.map((post, index) => (
            <View key={post.id} style={styles.postContainer}>
              <View style={styles.mediaContainer}>
                {renderMedia(post, index)}
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.postInfo}>
                <View style={styles.postHeader}>
                  <Text style={styles.postUsername}>{profileData.username}</Text>
                </View>
                
                {post.caption && (
                  <View style={styles.captionContainer}>
                    {formatCaption(post.caption)}
                  </View>
                )}

                <View style={styles.postFooter}>
                  <Text style={styles.postTime}>{formatTimestamp(post.timestamp)}</Text>
                  <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={() => handleShare(post.permalink)}
                  >
                    <Ionicons name="paper-plane-outline" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerUsername: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  chevron: {
    marginLeft: 4,
    marginTop: 2,
  },
  iconButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePic: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: '#333',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },
  profileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  category: {
    color: '#999',
    fontSize: 13,
  },
  bioSection: {
    marginTop: 8,
  },
  bioText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  websiteLink: {
    color: '#3897f0',
    fontSize: 14,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  followButton: {
    flex: 1,
    backgroundColor: '#0095f6',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#262626',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  postsSection: {
    marginTop: 20,
  },
  postContainer: {
    marginBottom: 20,
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
  },
  media: {
    width: SCREEN_WIDTH,
    aspectRatio: 1,
  },
  carouselIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  carouselText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#1a1a1a',
    marginTop: 8,
  },
  postInfo: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  postHeader: {
    marginBottom: 6,
  },
  postUsername: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 19,
  },
  hashtag: {
    color: '#4d9fed',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postTime: {
    color: '#999',
    fontSize: 12,
  },
  shareButton: {
    padding: 4,
  },
});

export default InstagramProfile;