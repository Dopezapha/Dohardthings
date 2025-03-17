/**
 * Utility functions for Stacks authentication and wallet handling
 */

// Helper function to extract Stacks address from user data
export const extractStacksAddress = (userData) => {
    if (!userData) return null;
    
    console.log('DEBUG - Full user data structure:', JSON.stringify(userData, null, 2));
    
    // Try all possible paths where the address might be located
    
    // 1. Check direct profile.stxAddress object (most common)
    if (userData.profile?.stxAddress) {
      // Check if it's an object with testnet/mainnet properties
      if (typeof userData.profile.stxAddress === 'object') {
        // Prefer testnet for development, but fall back to mainnet if testnet is not available
        const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
        if (address) {
          console.log('Found address in profile.stxAddress object:', address);
          return address;
        }
      } 
      // It might be a direct string
      else if (typeof userData.profile.stxAddress === 'string') {
        console.log('Found address as direct string in profile.stxAddress:', userData.profile.stxAddress);
        return userData.profile.stxAddress;
      }
    }
    
    // 2. Check if it's in the decentralizedID field
    if (userData.decentralizedID) {
      const didParts = userData.decentralizedID.split(':');
      if (didParts.length > 3) {
        const possibleAddress = didParts[didParts.length - 1];
        if (possibleAddress.startsWith('S') && possibleAddress.length > 20) {
          console.log('Found address in decentralizedID:', possibleAddress);
          return possibleAddress;
        }
      }
    }
    
    // 3. Check if it's in the apps object
    if (userData.profile?.apps) {
      // Try with current origin
      const appUrl = window.location.origin;
      if (userData.profile.apps[appUrl]) {
        const appData = userData.profile.apps[appUrl];
        
        // Check for direct stxAddress property
        if (appData.stxAddress) {
          console.log('Found address in apps[currentOrigin].stxAddress:', appData.stxAddress);
          return appData.stxAddress;
        }
        
        // Check for profile.stxAddress inside the app data
        if (appData.profile?.stxAddress) {
          if (typeof appData.profile.stxAddress === 'object') {
            const address = appData.profile.stxAddress.testnet || appData.profile.stxAddress.mainnet;
            if (address) {
              console.log('Found address in apps[currentOrigin].profile.stxAddress object:', address);
              return address;
            }
          } else if (typeof appData.profile.stxAddress === 'string') {
            console.log('Found address in apps[currentOrigin].profile.stxAddress string:', appData.profile.stxAddress);
            return appData.profile.stxAddress;
          }
        }
      }
      
      // If not found with current origin, try all apps
      for (const appKey in userData.profile.apps) {
        const appData = userData.profile.apps[appKey];
        
        // Check for direct stxAddress property
        if (appData.stxAddress) {
          console.log('Found address in apps[' + appKey + '].stxAddress:', appData.stxAddress);
          return appData.stxAddress;
        }
        
        // Check for profile.stxAddress inside the app data
        if (appData.profile?.stxAddress) {
          if (typeof appData.profile.stxAddress === 'object') {
            const address = appData.profile.stxAddress.testnet || appData.profile.stxAddress.mainnet;
            if (address) {
              console.log('Found address in apps[' + appKey + '].profile.stxAddress object:', address);
              return address;
            }
          } else if (typeof appData.profile.stxAddress === 'string') {
            console.log('Found address in apps[' + appKey + '].profile.stxAddress string:', appData.profile.stxAddress);
            return appData.profile.stxAddress;
          }
        }
      }
    }
    
    // 4. Look for any property that might contain a Stacks address (starts with S and has appropriate length)
    const findStacksAddressInObject = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return null;
      
      for (const key in obj) {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check if the value is a string and looks like a Stacks address
        if (typeof value === 'string' && value.startsWith('S') && value.length >= 32 && value.length <= 42) {
          console.log(`Found potential Stacks address in ${currentPath}:`, value);
          return value;
        }
        
        // Recursively check nested objects
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const nestedResult = findStacksAddressInObject(value, currentPath);
          if (nestedResult) return nestedResult;
        }
      }
      
      return null;
    };
    
    const potentialAddress = findStacksAddressInObject(userData);
    if (potentialAddress) {
      return potentialAddress;
    }
    
    // If we've tried everything and still can't find an address, log an error
    console.error('Could not find Stacks address in user data');
    return null;
  };
  
  // Format address for display (show only first and last few characters)
  export const formatStacksAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };  