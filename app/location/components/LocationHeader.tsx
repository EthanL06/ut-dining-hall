import React, { useState, useMemo } from 'react';
import { View, Text } from 'react-native';

import SearchBar from './SearchBar';
import TimeSchedule from './TimeSchedule';

import FilterBar from '~/components/FilterBar';
import TopBar from '~/components/TopBar';
import { generateSchedule, isLocationOpen } from '~/utils/time';

interface LocationHeaderProps {
  location: string;
  selectedMenu: string | null;
  setSelectedMenu: (menu: string) => void;
  filters: { title: string; id: string }[];
  query: string;
  setQuery: (query: string) => void;
}

const LocationHeader = React.memo(
  ({ location, selectedMenu, setSelectedMenu, filters, query, setQuery }: LocationHeaderProps) => {
    const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
    const schedule = useMemo(() => generateSchedule(location), [location]);

    return (
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

          <TimeSchedule
            schedule={schedule}
            isOpen={timeDropdownOpen}
            onToggle={() => setTimeDropdownOpen((prev) => !prev)}
          />

          <View className="my-1 w-full border-b border-b-ut-grey/15" />

          <View className="gap-y-3">
            <View className="flex-row items-center justify-between">
              <FilterBar
                selectedItem={selectedMenu as string}
                setSelectedItem={setSelectedMenu}
                useTimeOfDayDefault={filters.length > 1}
                items={filters}
                showFilterButton
              />
            </View>

            {filters && filters.length > 1 && <SearchBar query={query} setQuery={setQuery} />}
          </View>
        </View>
      </View>
    );
  }
);

export default LocationHeader;
