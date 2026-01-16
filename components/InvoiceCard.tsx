import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
import {
  Check,
  Bell,
  Trash2,
  Copy,
  CheckCircle,
  Send,
  XCircle,
  Eye,
  DollarSign,
  Zap,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useTheme } from "@/lib/theme";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { Invoice, InvoiceStatus, formatCurrency, formatRelativeDate } from "@/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * InvoiceCard Component - Apple Wallet Aesthetic + Haptic Touch
 *
 * Features:
 * - Physical Ticket / Pass design
 * - Long press context menu with "pop" animation
 * - Blur overlay with spring dismiss
 * - SF Symbols style icons
 */

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
  onMarkPaid?: () => void;
  onRemind?: () => void;
  onVoid?: () => void;
  onDuplicate?: () => void;
}

interface MenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
  destructive?: boolean;
}

export function InvoiceCard({
  invoice,
  onPress,
  onMarkPaid,
  onRemind,
  onVoid,
  onDuplicate,
}: InvoiceCardProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isPro } = useSubscriptionStore();
  const swipeableRef = useRef<Swipeable>(null);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const menuScaleAnim = useRef(new Animated.Value(0)).current;
  const menuOpacityAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacityAnim = useRef(new Animated.Value(0)).current;

  // Context menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [cardLayout, setCardLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const cardRef = useRef<View>(null);

  // Status dot colors with glow
  const getStatusDotColor = (status: InvoiceStatus): string => {
    switch (status) {
      case "paid":
        return colors.statusPaid;
      case "deposit_paid":
        return colors.systemOrange; // Orange for deposit paid, balance remaining
      case "sent":
        return colors.statusSent;
      case "overdue":
        return colors.statusOverdue;
      case "draft":
        return colors.statusDraft;
      case "void":
        return colors.textTertiary;
      default:
        return colors.textTertiary;
    }
  };

  // Check if invoice has deposit info to display
  const hasDepositInfo = invoice.deposit_enabled && invoice.deposit_amount && invoice.deposit_amount > 0;
  const remainingBalance = hasDepositInfo ? invoice.total - (invoice.amount_paid || 0) : invoice.total;
  const isDepositPaid = invoice.status === "deposit_paid" || (hasDepositInfo && (invoice.amount_paid || 0) > 0);

  const statusDotColor = getStatusDotColor(invoice.status);

  // Build menu actions based on invoice status
  const getMenuActions = useCallback((): MenuAction[] => {
    const actions: MenuAction[] = [];

    // Mark as Paid (if not already paid)
    if (invoice.status !== "paid" && invoice.status !== "void" && onMarkPaid) {
      actions.push({
        id: "mark_paid",
        label: "Mark as Paid",
        icon: <CheckCircle size={20} color={colors.statusPaid} strokeWidth={2} />,
        color: colors.statusPaid,
        onPress: () => {
          dismissMenu();
          setTimeout(() => onMarkPaid(), 200);
        },
      });
    }

    // Send Reminder (if sent or overdue)
    if ((invoice.status === "sent" || invoice.status === "overdue") && onRemind) {
      actions.push({
        id: "remind",
        label: "Send Reminder",
        icon: <Send size={20} color={colors.systemOrange} strokeWidth={2} />,
        color: colors.systemOrange,
        onPress: () => {
          dismissMenu();
          setTimeout(() => onRemind(), 200);
        },
      });
    }

    // Duplicate
    if (onDuplicate) {
      actions.push({
        id: "duplicate",
        label: "Duplicate",
        icon: <Copy size={20} color={colors.systemBlue} strokeWidth={2} />,
        color: colors.systemBlue,
        onPress: () => {
          dismissMenu();
          setTimeout(() => onDuplicate(), 200);
        },
      });
    }

    // Void / Delete (destructive)
    if (invoice.status !== "paid" && invoice.status !== "void" && onVoid) {
      actions.push({
        id: "void",
        label: "Void Invoice",
        icon: <XCircle size={20} color={colors.systemRed} strokeWidth={2} />,
        color: colors.systemRed,
        destructive: true,
        onPress: () => {
          dismissMenu();
          setTimeout(() => onVoid(), 200);
        },
      });
    }

    return actions;
  }, [invoice.status, onMarkPaid, onRemind, onDuplicate, onVoid, colors]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!menuVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  // Long press - show context menu with "pop" animation
  const handleLongPress = () => {
    // Heavy haptic for context menu
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Get card position for menu placement
    if (cardRef.current) {
      cardRef.current.measureInWindow((x, y, width, height) => {
        setCardLayout({ x, y, width, height });
      });
    }

    setMenuVisible(true);

    // Animate card scale UP to 1.05 (pop effect)
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      damping: 12,
      stiffness: 200,
      useNativeDriver: true,
    }).start();

    // Animate overlay and menu
    Animated.parallel([
      Animated.timing(overlayOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(menuScaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 250,
        delay: 50,
        useNativeDriver: true,
      }),
      Animated.timing(menuOpacityAnim, {
        toValue: 1,
        duration: 150,
        delay: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Dismiss menu with spring physics
  const dismissMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.parallel([
      // Card springs back
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 300,
        useNativeDriver: true,
      }),
      // Overlay fades
      Animated.timing(overlayOpacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      // Menu scales down
      Animated.spring(menuScaleAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 300,
        useNativeDriver: true,
      }),
      Animated.timing(menuOpacityAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
    });
  };

  // Right swipe action - Mark as Paid
  const renderRightAction = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (invoice.status === "paid" || !onMarkPaid) return null;

    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          swipeableRef.current?.close();
          onMarkPaid();
        }}
        style={[styles.swipeAction, { backgroundColor: colors.statusPaid }]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Check size={24} color="#FFFFFF" strokeWidth={2.5} />
        </Animated.View>
      </Pressable>
    );
  };

  // Left swipe actions
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.5, 1],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.leftActionsContainer}>
        {onRemind && invoice.status !== "paid" && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              swipeableRef.current?.close();
              onRemind();
            }}
            style={[styles.swipeAction, { backgroundColor: colors.systemOrange }]}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <Bell size={22} color="#FFFFFF" strokeWidth={2} />
            </Animated.View>
          </Pressable>
        )}
        {onVoid && invoice.status !== "paid" && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              swipeableRef.current?.close();
              onVoid();
            }}
            style={[styles.swipeAction, { backgroundColor: colors.systemRed }]}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <Trash2 size={22} color="#FFFFFF" strokeWidth={2} />
            </Animated.View>
          </Pressable>
        )}
      </View>
    );
  };

  // Format amount
  const formattedAmount = formatCurrency(invoice.total, invoice.currency);

  // Format relative date
  const relativeDate = invoice.created_at
    ? formatRelativeDate(invoice.created_at)
    : "Just now";

  // Format last action line (Sent X ago • Viewed Y ago OR Deposit info)
  const getLastActionLine = (): string => {
    // If deposit is paid, show deposit info line instead
    if (isDepositPaid && hasDepositInfo) {
      const paidAmount = invoice.amount_paid || 0;
      const balanceAmount = invoice.total - paidAmount;
      return `Deposit paid ${formatCurrency(paidAmount, invoice.currency)} • Balance ${formatCurrency(balanceAmount, invoice.currency)}`;
    }

    const parts: string[] = [];

    if (invoice.sent_at) {
      const sentDate = new Date(invoice.sent_at);
      const now = new Date();
      const diffMs = now.getTime() - sentDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffDays > 0) {
        parts.push(`Sent ${diffDays}d ago`);
      } else if (diffHours > 0) {
        parts.push(`Sent ${diffHours}h ago`);
      } else {
        parts.push("Sent just now");
      }
    }

    if (invoice.viewed_at) {
      const viewedDate = new Date(invoice.viewed_at);
      const now = new Date();
      const diffMs = now.getTime() - viewedDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffDays > 0) {
        parts.push(`Viewed ${diffDays}d ago`);
      } else if (diffHours > 0) {
        parts.push(`Viewed ${diffHours}h ago`);
      } else {
        parts.push("Viewed just now");
      }
    }

    return parts.join(" • ");
  };

  const lastActionLine = getLastActionLine();
  const isViewed = !!invoice.viewed_at;

  // Show contextual PRO upsell for viewed but unpaid invoices (non-PRO users)
  const showProUpsell =
    !isPro &&
    isViewed &&
    (invoice.status === "sent" || invoice.status === "overdue") &&
    !isDepositPaid;

  const handleProUpsellPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/paywall?trigger=auto_chase");
  };

  const menuActions = getMenuActions();

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightAction}
        renderLeftActions={renderLeftActions}
        friction={2}
        overshootRight={false}
        overshootLeft={false}
        containerStyle={styles.swipeableContainer}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={400}
        >
          <Animated.View
            ref={cardRef}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                transform: [{ scale: scaleAnim }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 12,
              },
            ]}
          >
            {/* Top Row: Client Name + Status Indicators */}
            <View style={styles.topRow}>
              {/* Client Name (Top Left) */}
              <Text
                style={[styles.clientName, { color: colors.text }]}
                numberOfLines={1}
              >
                {invoice.client_name}
              </Text>

              {/* Status Indicators (Top Right) */}
              <View style={styles.statusIndicators}>
                {/* Deposit Paid Pill */}
                {isDepositPaid && invoice.status !== "paid" && (
                  <View style={[styles.depositPill, { backgroundColor: colors.systemOrange + "18" }]}>
                    <DollarSign size={10} color={colors.systemOrange} strokeWidth={2.5} />
                    <Text style={[styles.depositPillText, { color: colors.systemOrange }]}>
                      Deposit Paid
                    </Text>
                  </View>
                )}

                {/* Viewed Pill - PRO feature surfaced (only show if not deposit paid) */}
                {isViewed && invoice.status !== "paid" && !isDepositPaid && (
                  <View style={[styles.viewedPill, { backgroundColor: colors.statusPaid + "18" }]}>
                    <Eye size={10} color={colors.statusPaid} strokeWidth={2.5} />
                    <Text style={[styles.viewedPillText, { color: colors.statusPaid }]}>
                      Viewed
                    </Text>
                  </View>
                )}

                {/* Status Dot - Glowing */}
                <View style={styles.statusDotContainer}>
                  {/* Glow layer */}
                  <View
                    style={[
                      styles.statusDotGlow,
                      {
                        backgroundColor: statusDotColor,
                        shadowColor: statusDotColor,
                      },
                    ]}
                  />
                  {/* Main dot */}
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusDotColor },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Middle Row: Last Action Line (Sent X ago • Viewed Y ago) */}
            {lastActionLine && (
              <Text style={[styles.lastActionText, { color: colors.textTertiary }]}>
                {lastActionLine}
              </Text>
            )}

            {/* Bottom Row: Date + Amount */}
            <View style={styles.bottomRow}>
              {/* Relative Date (Bottom Left) - only show if no lastActionLine */}
              {!lastActionLine && (
                <Text style={[styles.dateText, { color: colors.textTertiary }]}>
                  {relativeDate}
                </Text>
              )}
              {lastActionLine && <View />}

              {/* Amount (Bottom Right) */}
              <Text style={[styles.amount, { color: colors.text }]}>
                {formattedAmount}
              </Text>
            </View>

            {/* Contextual PRO Upsell - Show for viewed but unpaid invoices */}
            {showProUpsell && (
              <Pressable
                onPress={handleProUpsellPress}
                style={[
                  styles.proUpsellBanner,
                  { backgroundColor: colors.primary + "10", borderTopColor: colors.border },
                ]}
              >
                <Zap size={14} color={colors.primary} strokeWidth={2.5} />
                <Text style={[styles.proUpsellText, { color: colors.primary }]}>
                  Viewed but not paid? Let Auto-Chase follow up
                </Text>
                <ChevronRight size={14} color={colors.primary} />
              </Pressable>
            )}
          </Animated.View>
        </Pressable>
      </Swipeable>

      {/* Context Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={dismissMenu}
      >
        {/* Blur Overlay - Tap to dismiss */}
        <Pressable style={styles.modalOverlay} onPress={dismissMenu}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { opacity: overlayOpacityAnim },
            ]}
          >
            {Platform.OS === "ios" ? (
              <BlurView
                intensity={30}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)" },
                ]}
              />
            )}
          </Animated.View>
        </Pressable>

        {/* Floating Card Clone (elevated) */}
        <Animated.View
          style={[
            styles.floatingCard,
            {
              backgroundColor: colors.card,
              top: cardLayout.y - 20,
              left: cardLayout.x,
              width: cardLayout.width,
              transform: [{ scale: scaleAnim }],
              opacity: overlayOpacityAnim,
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.topRow}>
            <Text
              style={[styles.clientName, { color: colors.text }]}
              numberOfLines={1}
            >
              {invoice.client_name}
            </Text>
            <View style={styles.statusIndicators}>
              {isDepositPaid && invoice.status !== "paid" && (
                <View style={[styles.depositPill, { backgroundColor: colors.systemOrange + "18" }]}>
                  <DollarSign size={10} color={colors.systemOrange} strokeWidth={2.5} />
                  <Text style={[styles.depositPillText, { color: colors.systemOrange }]}>Deposit Paid</Text>
                </View>
              )}
              {isViewed && invoice.status !== "paid" && !isDepositPaid && (
                <View style={[styles.viewedPill, { backgroundColor: colors.statusPaid + "18" }]}>
                  <Eye size={10} color={colors.statusPaid} strokeWidth={2.5} />
                  <Text style={[styles.viewedPillText, { color: colors.statusPaid }]}>Viewed</Text>
                </View>
              )}
              <View style={styles.statusDotContainer}>
                <View
                  style={[
                    styles.statusDotGlow,
                    { backgroundColor: statusDotColor, shadowColor: statusDotColor },
                  ]}
                />
                <View style={[styles.statusDot, { backgroundColor: statusDotColor }]} />
              </View>
            </View>
          </View>
          {lastActionLine && (
            <Text style={[styles.lastActionText, { color: colors.textTertiary }]}>
              {lastActionLine}
            </Text>
          )}
          <View style={styles.bottomRow}>
            {!lastActionLine && (
              <Text style={[styles.dateText, { color: colors.textTertiary }]}>
                {relativeDate}
              </Text>
            )}
            {lastActionLine && <View />}
            <Text style={[styles.amount, { color: colors.text }]}>
              {formattedAmount}
            </Text>
          </View>
        </Animated.View>

        {/* Context Menu */}
        <Animated.View
          style={[
            styles.contextMenu,
            {
              backgroundColor: isDark ? colors.backgroundSecondary : "#FFFFFF",
              top: cardLayout.y + cardLayout.height + 8,
              left: Math.max(16, Math.min(cardLayout.x, SCREEN_WIDTH - 200 - 16)),
              opacity: menuOpacityAnim,
              transform: [
                { scale: menuScaleAnim },
                {
                  translateY: menuScaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {menuActions.map((action, index) => (
            <Pressable
              key={action.id}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.menuItem,
                index < menuActions.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
                pressed && { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <View style={styles.menuItemIcon}>{action.icon}</View>
              <Text
                style={[
                  styles.menuItemLabel,
                  {
                    color: action.destructive ? colors.systemRed : colors.text,
                  },
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    elevation: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  clientName: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
    flex: 1,
    marginRight: 12,
  },
  statusIndicators: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewedPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  viewedPillText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  depositPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  depositPillText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  lastActionText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: -0.1,
    marginBottom: 8,
  },
  statusDotContainer: {
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDotGlow: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  amount: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
  },
  leftActionsContainer: {
    flexDirection: "row",
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    borderRadius: 22,
    marginRight: 8,
  },
  // Context Menu Styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingCard: {
    position: "absolute",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 20,
  },
  contextMenu: {
    position: "absolute",
    minWidth: 200,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemIcon: {
    width: 28,
    alignItems: "center",
  },
  menuItemLabel: {
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: -0.4,
    marginLeft: 12,
  },
  proUpsellBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginHorizontal: -18,
    marginBottom: -18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    gap: 6,
  },
  proUpsellText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: -0.1,
    flex: 1,
  },
});
