import { FlashList } from '@shopify/flash-list';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronDown, Clock } from 'lucide-react-native';
import React, { useState, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Container } from '~/components/Container';
import FilterBar from '~/components/FilterBar';
import FoodComponent from '~/components/FoodComponent';
import TopBar from '~/components/TopBar';
import { FoodItem, MenuCategory, useDataStore } from '~/store/useDataStore';
import { COLORS } from '~/utils/colors';
import { generateSchedule, isLocationOpen } from '~/utils/time';
import { cn } from '~/utils/utils';

const MenuCategoryItem = React.memo(
  ({
    categoryName,
    foodItems,
    selectedMenu,
  }: {
    categoryName: string;
    foodItems: FoodItem[];
    selectedMenu: string;
  }) => {
    const [showFood, setShowFood] = useState(true);
    const { location } = useLocalSearchParams();

    const toggleShowFood = useCallback(() => {
      setShowFood((prev) => !prev);
    }, []);

    return (
      <View className="my-4 flex-col px-6">
        <TouchableOpacity
          onPress={toggleShowFood}
          className="mb-3 flex-row items-center justify-between overflow-hidden">
          <Text className="text-2xl font-bold">{categoryName}</Text>
          <View
            className={cn(
              'transition-transform duration-200 ease-in-out',
              showFood ? 'rotate-180 transform' : 'rotate-0'
            )}>
            <ChevronDown size={20} color={COLORS['ut-grey']} />
          </View>
        </TouchableOpacity>

        <FlashList
          data={foodItems}
          estimatedItemSize={20}
          renderItem={({ item: food }) => (
            <FoodComponent
              food={food}
              selectedMenu={selectedMenu}
              categoryName={categoryName}
              location={location as string}
              showFood={showFood}
            />
          )}
          extraData={showFood}
        />
      </View>
    );
  }
);

const MenuItem = ({
  menuCategories,
  selectedMenu,
}: {
  menuCategories: MenuCategory[];
  selectedMenu: string;
}) => {
  return (
    <>
      {menuCategories.map((menuCategory: MenuCategory) => (
        <MenuCategoryItem
          key={menuCategory.title}
          categoryName={menuCategory.title as string}
          foodItems={menuCategory.food_item}
          selectedMenu={selectedMenu}
        />
      ))}
    </>
  );
};

const Location = () => {
  const {
    location,
  }: {
    location: string;
  } = useLocalSearchParams();
  const getLocationData = useDataStore((state) => state.getLocationData);
  const data = getLocationData(location);

  const [selectedMenu, setSelectedMenu] = useState(
    data?.menu.length === 1 ? data.menu[0].name : ''
  );
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);

  const filteredData = useMemo(() => {
    return data?.menu.filter((menu) => menu.name === selectedMenu);
  }, [data, selectedMenu]);

  if (!data) {
    router.back();
    return null;
  }

  const schedule = generateSchedule(location);

  const filters = data.menu
    .filter((item) => item.name !== null)
    .map((item) => ({
      id: item.name as string,
      title: item.name as string,
    }));

  return (
    <>
      <Stack.Screen options={{ title: 'Location' }} />
      <Container className="mx-0 flex-1">
        <FlashList
          data={filteredData}
          estimatedItemSize={20}
          removeClippedSubviews
          ListHeaderComponent={
            <View className="mx-6 mt-6 flex gap-y-5">
              <TopBar variant="location" />
              <View className="gap-y-4">
                <View>
                  <View className="w-full flex-row items-center justify-between">
                    <Text className="font-sans text-3xl font-extrabold">{location}</Text>
                  </View>
                  <Text className="text-lg font-semibold text-ut-burnt-orange">
                    {isLocationOpen(location) ? 'Open' : 'Closed'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setTimeDropdownOpen(!timeDropdownOpen);
                  }}
                  className="flex flex-row items-start gap-4">
                  {/* Left Column: Day Ranges */}
                  <View className="flex flex-col gap-1.5">
                    {(timeDropdownOpen ? schedule : schedule.slice(0, 1)).map((item, index) => (
                      <View key={item.dayRange} className="flex flex-row gap-2">
                        {/* Show Clock icon only for the first item */}
                        <View className={index === 0 ? 'flex' : 'invisible'}>
                          <Clock size={12} color={COLORS['ut-grey']} />
                        </View>
                        <Text className="text-sm leading-none text-ut-grey">{item.dayRange}:</Text>
                      </View>
                    ))}
                  </View>

                  {/* Right Column: Times */}
                  <View className="flex flex-col gap-1.5">
                    {(timeDropdownOpen ? schedule : schedule.slice(0, 1)).map((item, index) => (
                      <View key={item.dayRange} className="flex flex-row gap-2">
                        <Text key={index} className={cn('text-sm leading-none text-ut-grey')}>
                          {item.time}
                        </Text>

                        {index === 0 && (
                          <View
                            className={cn(
                              'transition-transform duration-200 ease-in-out',
                              timeDropdownOpen ? 'rotate-180 transform' : 'rotate-0'
                            )}>
                            <ChevronDown size={12} color={COLORS['ut-grey']} />
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>

                <View className="my-1 w-full border-b border-b-ut-grey/15" />

                <FilterBar
                  selectedItem={selectedMenu as string}
                  setSelectedItem={setSelectedMenu}
                  useTimeOfDayDefault={filters.length > 1}
                  items={filters}
                />
              </View>
            </View>
          }
          ListEmptyComponent={
            <View className="mt-12 flex-1 items-center justify-center">
              <Text className="text-xl font-bold text-ut-burnt-orange">No items found.</Text>
              <Text className="text-sm">Please try again later.</Text>
            </View>
          }
          renderItem={({ item: menu }) => {
            return (
              <MenuItem selectedMenu={selectedMenu as string} menuCategories={menu.menu_category} />
            );
          }}
        />
      </Container>
    </>
  );
};

export default Location;
