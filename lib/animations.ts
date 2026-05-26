/**
 * Framer Motion Animation Library
 * Standardized animation patterns for consistent UI interactions
 */

export const animations = {
  // ENTRY ANIMATIONS
  entry: {
    fadeUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: "easeOut" },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.3, ease: "easeOut" },
    },
    slideInLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.4, ease: "easeOut" },
    },
    slideInRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },

  // HOVER EFFECTS
  hover: {
    scale: { scale: 1.05 },
    scaleSmall: { scale: 1.02 },
    lift: { y: -4 },
    glow: { boxShadow: "0 0 40px rgba(239, 68, 68, 0.3)" },
  },

  // TAP/CLICK EFFECTS
  tap: {
    scale: { scale: 0.95 },
  },

  // CONTAINER ANIMATIONS
  container: {
    stagger: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },

  // AMBIENT/CONTINUOUS ANIMATIONS
  ambient: {
    pulse: {
      animate: { scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] },
      transition: { duration: 15, repeat: Infinity, ease: "linear" },
    },
    glow: {
      animate: { scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] },
      transition: { duration: 20, repeat: Infinity, ease: "easeInOut" },
    },
    float: {
      animate: { y: [0, -10, 0] },
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    },
    rotate: {
      animate: { rotate: 360 },
      transition: { duration: 20, repeat: Infinity, ease: "linear" },
    },
    rotateSlowReverse: {
      animate: { rotate: -360 },
      transition: { duration: 30, repeat: Infinity, ease: "linear" },
    },
  },

  // PAGE TRANSITIONS
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeOut" },
  },

  // ACTIVE STATE ANIMATIONS
  activeState: {
    smooth: {
      transition: { duration: 0.2, ease: "easeInOut" },
    },
    spring: {
      transition: { type: "spring", bounce: 0.2, duration: 0.6 },
    },
  },

  // BUTTON ANIMATIONS
  button: {
    primary: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
      transition: { type: "spring", stiffness: 400, damping: 17 },
    },
    secondary: {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
    },
  },

  // CARD ANIMATIONS
  card: {
    hover: {
      scale: 1.02,
      boxShadow: "0 0 40px rgba(239, 68, 68, 0.3)",
    },
    entry: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4 },
    },
  },

  // LOADING SPINNER
  spinner: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: "linear" },
  },

  // BADGE/BADGE PULSE
  badge: {
    pulse: {
      animate: { scale: [1, 1.1, 1] },
      transition: { duration: 2, repeat: Infinity },
    },
  },

  // STAGGER DELAYS
  staggerDelays: {
    small: 0.05,
    medium: 0.1,
    large: 0.15,
  },
}

/**
 * Variants for motion components
 */
export const variants = {
  // Container for staggered children
  listContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },

  // Child items
  listItem: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  },

  // Tab variants
  tab: {
    active: {
      borderColor: "rgba(0, 0, 0, 1)",
      transition: { duration: 0.2 },
    },
    inactive: {
      borderColor: "transparent",
      transition: { duration: 0.2 },
    },
  },

  // Modal variants
  modal: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, type: "spring", bounce: 0.3 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  },
}
