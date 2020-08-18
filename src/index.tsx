import React from 'react';
import { getStyleStr, genRandomId, getDrawPatternByCanvas } from './utils';
import SecurityDefense from './security-defense';
import { Options, Observers } from './interface';

export interface WatermarkProps {
  /**
   * 额外的样式
   */
  style?: React.CSSProperties;
  /**
   * 是否开启监视模式
   */
  monitor?: boolean;
  /**
   * 指定渲染引擎
   */
  renderer?: 'canvas' | 'svg'
  /**
   * 水印文本
   */
  text?: string | string[];
  /**
   * 水印配置
   */
  options?: Options;
  /**
   *
   */
  securityAlarm?: () => void;
}

const defaultOptions: Options = {
  width: 160,
  height: 100,
  opacity: 0.15,
  rotate: -20,
  fontColor: '#727071',
  fontWeight: 'normal',
  fontFamily: 'sans-serif',
  fontSize: 9,
}

const defaultStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  opacity: 0.7,
  zIndex: 9999,
  pointerEvents: 'none',
  overflow: 'hidden',
  backgroundColor: 'transparent',
  backgroundRepeat: 'repeat'
};

const waterMarkStyle = getStyleStr(defaultStyle);
const noop = function () {};

const Watermark: React.FC<WatermarkProps> = ({
  style,
  text,
  monitor,
  options,
  securityAlarm,
  children
}) => {
  const watermarkId = genRandomId('watermark');
  const watermarkWrapperId = genRandomId('watermark-wrapper');

  const security = React.useRef<any>(null);
  const DOMRemoveObserver = React.useRef<any>();
  const DOMAttrModifiedObserver = React.useRef<any>();

  React.useEffect(() => {
    if (monitor) {
      security.current = new SecurityDefense(
        {
          watermarkId: watermarkId,
          watermarkWrapperId: watermarkWrapperId
        },
        {
          waterMarkStyle,
          getCanvasUrl: getCanvasUrl
        },
        {
          securityAlarm,
          updateObserver: updateObserver
        }
      );
    }
    return () => {
      DOMRemoveObserver.current && DOMRemoveObserver.current.disconnect();
      DOMAttrModifiedObserver.current && DOMAttrModifiedObserver.current.disconnect();
      security.current = null;
    }
  }, []);

  const getCanvasUrl = () => {
    const newOptions = Object.assign({}, defaultOptions, options)
    return getDrawPatternByCanvas(text, newOptions)
  }

  const updateObserver = (observers: Observers = {}) => {
    if (observers.DOMRemoveObserver) {
      DOMRemoveObserver.current = observers.DOMRemoveObserver
    }
    if (observers.DOMAttrModifiedObserver) {
      DOMAttrModifiedObserver.current = observers.DOMAttrModifiedObserver
    }
  }

  const watermarkStyles: React.CSSProperties = {
    ...defaultStyle,
    backgroundImage: `url("${getCanvasUrl()}")`
  }

  return (
    <div style={{ ...style, position: 'relative', overflow: 'hidden' }} id={watermarkWrapperId}>
      <div style={watermarkStyles} id={watermarkId} />
      {children}
    </div>
  )
}

Watermark.defaultProps = {
  monitor: true,
  renderer: 'canvas',
  options: defaultOptions,
  securityAlarm: noop
}

export default Watermark;
