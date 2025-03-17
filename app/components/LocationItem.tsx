import { eq } from 'drizzle-orm';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';

import { Location, menu } from '~/db/schema';
import { useDatabase } from '~/hooks/useDatabase';
import { COLORS } from '~/utils/colors';
import { getLocationTimeMessage, isLocationOpen } from '~/utils/time';
import { cn } from '~/utils/utils';

type LocationItemProps = {
  location: Location;
  currentTime: Date;
};

const LocationItem = ({ location, currentTime }: LocationItemProps) => {
  const [open, setOpen] = useState(false);
  const pingAnimation = useRef(new Animated.Value(0)).current;
  const db = useDatabase();

  useEffect(() => {
    const checkOpen = async () => {
      // Checking if there are any menus for the location
      const res = db.select().from(menu).where(eq(menu.location_id, location.id)).get();

      if (!res) {
        setOpen(false);
        return;
      }

      setOpen(isLocationOpen(location.name as string, currentTime));
    };

    checkOpen();
  }, [currentTime]);
  // const open = isLocationOpen(location.name as string, currentTime);

  useEffect(() => {
    // Stop any running animation
    pingAnimation.stopAnimation();
    pingAnimation.setValue(0);

    if (open) {
      startPingAnimation();
    }

    return () => {
      // Clean up animation on unmount
      pingAnimation.stopAnimation();
    };
  }, [open]);

  const startPingAnimation = () => {
    // Create a looping animation that expands and fades
    Animated.loop(
      Animated.sequence([
        Animated.timing(pingAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
          delay: 2000,
        }),
        Animated.timing(pingAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return (
    <TouchableOpacity
      onPress={async () => {
        router.push(`/location/${location.name}`);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
      className="flex-row items-center justify-between rounded border border-ut-grey/15 p-4">
      <View className="flex-row items-center justify-center gap-x-4">
        <View className="relative size-3">
          <View
            className={cn(
              'size-full rounded-full shadow',
              open ? 'bg-green-500 shadow-green-500' : 'bg-red-300 shadow-red-300'
            )}
          />

          {open && (
            <Animated.View
              style={{
                position: 'absolute',
                width: 12,
                height: 12,
                borderRadius: 12,
                backgroundColor: 'rgba(34, 197, 94, 0.75)',
                transform: [
                  {
                    scale: pingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.25, 2.5],
                    }),
                  },
                ],
                opacity: pingAnimation.interpolate({
                  inputRange: [0, 0.4, 1],
                  outputRange: [0.8, 0.4, 0],
                }),
                top: -1,
                left: -1,
              }}
            />
          )}
        </View>
        <View>
          <Text className={cn('text-xl font-bold', open ? 'text-ut-black' : 'text-ut-grey/75')}>
            {location.name}
          </Text>
          <Text className="text-xs font-medium text-ut-grey/75">
            {open ? getLocationTimeMessage(location.name as string, currentTime) : 'Closed'}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-center gap-x-3">
        <ChevronRight color={COLORS['ut-burnt-orange']} size={20} />
      </View>
    </TouchableOpacity>
  );
};

export default LocationItem;
