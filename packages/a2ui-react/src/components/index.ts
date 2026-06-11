import React from 'react';
import { Text } from './Text';

export interface RenderFunction {
  (props: any): React.ReactElement;
}

export interface RenderMap {
  [componentName: string]: RenderFunction;
}

export const renderMap: RenderMap = {
  Text: (props: any) => React.createElement(Text, props)
};

export { Text };
