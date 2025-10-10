import React from 'react';
import { View } from 'react-native';
import { themeColors } from '../theme';

interface SkeletonProps {
  h?: number;
  w?: number | string;
  r?: number;
}

export const Skeleton = ({ h = 16, w = '100%', r = 12 }: SkeletonProps) => (
  <View 
    style={{ 
      height: h, 
      width: w, 
      borderRadius: r, 
      backgroundColor: themeColors.grayLight, 
      opacity: 0.8 
    }} 
  />
);





