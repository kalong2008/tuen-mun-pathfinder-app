import { Fragment, type ReactElement, type ReactNode } from 'react';
import { Platform, StyleSheet } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { renderMenuCheckboxItem } from '@/components/menu/renderMenuCheckboxItem';
import type { MenuOption } from '@/lib/header-menu-options';

type RenderMenuCheckboxGroupOptions<T extends string> = {
  groupKey: string;
  label: string;
  options: readonly MenuOption<T>[];
  isSelected: (value: T) => boolean;
  onSelect: (value: T) => void;
  showSeparator?: boolean;
};

export function renderMenuCheckboxGroup<T extends string>({
  groupKey,
  label,
  options,
  isSelected,
  onSelect,
  showSeparator = false,
}: RenderMenuCheckboxGroupOptions<T>) {
  const items = options.map((option) =>
    renderMenuCheckboxItem({
      itemKey: `${groupKey}-${option.value}`,
      option,
      selected: isSelected(option.value),
      onSelect,
    }),
  );

  if (Platform.OS === 'android') {
    const selectedLabel = options.find((option) => isSelected(option.value))?.label;

    return (
      <Fragment key={groupKey}>
        {showSeparator ? <DropdownMenu.Separator /> : null}
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger key={groupKey}>
            <DropdownMenu.ItemTitle>{label}</DropdownMenu.ItemTitle>
            {selectedLabel ? (
              <DropdownMenu.ItemSubtitle>{selectedLabel}</DropdownMenu.ItemSubtitle>
            ) : null}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Group>{items}</DropdownMenu.Group>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </Fragment>
    );
  }

  return (
    <Fragment key={groupKey}>
      {showSeparator ? <DropdownMenu.Separator /> : null}
      <DropdownMenu.Group>
        <DropdownMenu.Label>{label}</DropdownMenu.Label>
        {items}
      </DropdownMenu.Group>
    </Fragment>
  );
}

type FilterDropdownMenuProps = {
  trigger: ReactElement;
  children: ReactNode;
  rootStyle?: React.ComponentProps<typeof DropdownMenu.Root>['style'];
};

export function FilterDropdownMenu({ trigger, children, rootStyle }: FilterDropdownMenuProps) {
  return (
    <DropdownMenu.Root
      style={
        Platform.OS === 'android'
          ? [styles.androidRoot, rootStyle]
          : rootStyle
      }
    >
      <DropdownMenu.Trigger>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Content>{children}</DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

const styles = StyleSheet.create({
  androidRoot: {
    width: 36,
    height: 36,
    alignSelf: 'flex-end',
  },
});
