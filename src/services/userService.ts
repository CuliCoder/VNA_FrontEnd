// This is a minimal implementation for the required endpoints

// Mock types
export interface UserProfile {
  username: string;
  fullName: string;
  dob: string;
  gender: string;
  jobTitle: string;
  role: string;
  email: string;
  province: string;
  ward: string;
  address: string;
  isActive: boolean;
  avatarUrl?: string;
}

// Simulated API calls
export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    // GET /api/users/me
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          username: "Vna25112020",
          fullName: "Phan Thanh Tùng",
          dob: "1995-06-01",
          gender: "male",
          jobTitle: "",
          role: "admin",
          email: "phanthanhntung093@gmail.com",
          province: "HCM",
          ward: "GV",
          address: "",
          isActive: true,
        });
      }, 500);
    });
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<void> => {
    // PUT /api/users/profile
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Profile updated:", data);
        resolve();
      }, 500);
    });
  },

  requestEmailChange: async (): Promise<void> => {
    // POST /api/users/email-change/request
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Email change requested, OTP sent");
        resolve();
      }, 500);
    });
  },

  verifyEmailChangeOtp: async (otp: string): Promise<boolean> => {
    // POST /api/users/email-change/verify
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("OTP verified:", otp);
        resolve(otp === "123456");
      }, 500);
    });
  },

  updateEmail: async (newEmail: string): Promise<void> => {
    // POST /api/users/email-change/update
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Email updated:", newEmail);
        resolve();
      }, 500);
    });
  }
};
