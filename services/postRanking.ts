// services/postRanking.ts - Service xử lý ranking và filtering posts

import { isSameCity, cityToProvinceCode } from '../utils/geoMatch';

export interface PostRankingOptions {
  userCity?: string;
  profileCity?: string;
  selectedCity?: string;
  strictCityFilter?: boolean; // true = loại bỏ, false = ưu tiên
}

export interface RankedPost {
  _score: number;
  _price: number;
  _cityMatch: boolean;
  _cityScore: number;
}

/**
 * Filter posts by city with different strategies
 */
export function filterPostsByCity(
  posts: any[],
  options: PostRankingOptions
): { filtered: any[]; cityInfo: { hardCity: string; strategy: string } } {
  const { userCity, profileCity, selectedCity, strictCityFilter = false } = options;
  
  // Determine the city to filter by (priority: selected > profile > user)
  const hardCity = ((selectedCity || profileCity || userCity || '') as string).trim();
  
  if (!hardCity) {
    return { filtered: posts, cityInfo: { hardCity: '', strategy: 'no-filter' } };
  }

  if (strictCityFilter) {
    // Strict filtering: remove posts not in the same city
    const filtered = posts.filter((post) => {
      const postCity = post.address?.city || post.address?.provinceName || post.location || '';
      const okByName = isSameCity(postCity, hardCity);
      const targetCode = cityToProvinceCode(hardCity);
      const okByCode = targetCode && (post.address?.provinceCode === targetCode);
      return okByName || Boolean(okByCode);
    });
    
    return { 
      filtered, 
      cityInfo: { hardCity, strategy: 'strict-filter' } 
    };
  } else {
    // Priority filtering: keep all posts but add city match info
    const postsWithCityInfo = posts.map((post) => {
      const postCity = post.address?.city || post.address?.provinceName || post.location || '';
      const okByName = isSameCity(postCity, hardCity);
      const targetCode = cityToProvinceCode(hardCity);
      const okByCode = targetCode && (post.address?.provinceCode === targetCode);
      const cityMatch = okByName || Boolean(okByCode);
      
      return {
        ...post,
        _cityMatch: cityMatch,
        _cityScore: cityMatch ? 100 : 0
      };
    });
    
    return { 
      filtered: postsWithCityInfo, 
      cityInfo: { hardCity, strategy: 'priority-filter' } 
    };
  }
}

/**
 * Calculate base score for a post based on user profile
 */
export function calculateBaseScore(post: any, profile: any): number {
  if (!profile) return 0;
  
  let score = 0;
  
  // City preference (1000 points) - HIGHEST PRIORITY
  const preferredCity = profile.preferredCity;
  if (preferredCity && post.address?.city) {
    const postCity = post.address.city || post.address?.provinceName || post.location || '';
    if (isSameCity(postCity, preferredCity)) {
      score += 1000; // City match gets highest score
    }
  }
  
  // Ward preference (500 points) - SECOND PRIORITY
  const preferredWards = profile.preferredWards || [];
  if (preferredWards.length > 0 && post.address?.ward) {
    const postWard = post.address.ward;
    if (preferredWards.some((ward: string) => 
      postWard.toLowerCase().includes(ward.toLowerCase()) ||
      ward.toLowerCase().includes(postWard.toLowerCase())
    )) {
      score += 500; // Ward match gets high score
    }
  }
  
  // Room type preference (100 points) - THIRD PRIORITY
  const preferredRoomTypes = profile.roomType || [];
  if (preferredRoomTypes.length > 0) {
    const postCategory = post.category?.replace('-', '_');
    if (preferredRoomTypes.includes(postCategory)) {
      score += 100;
    }
  }
  
  // Budget preference (50 points) - FOURTH PRIORITY
  const budgetRange = profile.budgetRange;
  if (budgetRange && post.price) {
    const { min, max } = budgetRange;
    if (post.price >= min && post.price <= max) {
      score += 50;
    } else if (post.price < min) {
      score += 30; // Slightly below budget is okay
    } else if (post.price > max) {
      const overBudget = post.price - max;
      const overBudgetPercent = overBudget / max;
      if (overBudgetPercent <= 0.2) { // Within 20% over budget
        score += 10;
      }
    }
  }
  
  // Amenities preference (20 points) - LOWEST PRIORITY
  const preferredAmenities = profile.amenities || [];
  if (preferredAmenities.length > 0) {
    const postAmenities = post.amenities || [];
    const matchedAmenities = preferredAmenities.filter((amenity: string) =>
      postAmenities.includes(amenity)
    );
    score += (matchedAmenities.length / preferredAmenities.length) * 20;
  }
  
  return Math.round(score);
}

/**
 * Rank posts with city priority and other factors
 */
export function rankPosts(
  posts: any[],
  profile: any,
  options: PostRankingOptions = {}
): { ranked: any[]; cityInfo: { hardCity: string; strategy: string } } {
  const { filtered, cityInfo } = filterPostsByCity(posts, options);
  
  const ranked = filtered
    .map((post) => {
      const baseScore = calculateBaseScore(post, profile);
      const cityBonus = post._cityScore || 0;
      const finalScore = baseScore + cityBonus;
      
      return {
        ...post,
        _score: finalScore,
        _price: post.price ?? 0
      };
    })
    .sort((a, b) => {
      // Primary sort: by score (higher first)
      if (b._score !== a._score) return b._score - a._score;
      
      // Secondary sort: by city match (city matches first)
      if (a._cityMatch !== b._cityMatch) return b._cityMatch ? 1 : -1;
      
      // Tertiary sort: by price proximity to budget
      if (profile?.budgetRange) {
        const { min, max } = profile.budgetRange;
        const midBudget = (min + max) / 2;
        const aDistance = Math.abs(a._price - midBudget);
        const bDistance = Math.abs(b._price - midBudget);
        return aDistance - bDistance;
      }
      
      // Final sort: by price (lower first)
      return a._price - b._price;
    });
  
  return { ranked, cityInfo };
}

/**
 * Get city ranking info for display
 */
export function getCityRankingInfo(cityInfo: { hardCity: string; strategy: string }) {
  const { hardCity, strategy } = cityInfo;
  
  if (!hardCity) {
    return { message: 'Không có thông tin thành phố', type: 'info' };
  }
  
  switch (strategy) {
    case 'strict-filter':
      return { 
        message: `Chỉ hiển thị bài đăng tại ${hardCity}`, 
        type: 'success' 
      };
    case 'priority-filter':
      return { 
        message: `Ưu tiên bài đăng tại ${hardCity}`, 
        type: 'info' 
      };
    default:
      return { 
        message: `Hiển thị tất cả bài đăng`, 
        type: 'info' 
      };
  }
}
