import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MotiView } from 'moti';

export default function AnimatedList({ data, renderItem, estimatedItemSize = 100, ...props }) {
  const renderAnimatedItem = ({ item, index }) => {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9, translateY: 20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{
          type: 'spring',
          delay: index * 100, // Stagger effect
          damping: 15,
        }}
      >
        {renderItem({ item, index })}
      </MotiView>
    );
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        renderItem={renderAnimatedItem}
        estimatedItemSize={estimatedItemSize}
        showsVerticalScrollIndicator={false}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
