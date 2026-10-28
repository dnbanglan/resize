import { fabric } from 'fabric';

declare module 'fabric' {
  namespace fabric {
    interface Object {
      __layerId?: string;
      __layerName?: string;
    }
    interface IObjectOptions {
      __layerId?: string;
      __layerName?: string;
    }
    interface ITextOptions {
      __layerId?: string;
      __layerName?: string;
    }
    interface IRectOptions {
      __layerId?: string;
      __layerName?: string;
    }
    interface ICircleOptions {
      __layerId?: string;
      __layerName?: string;
    }
    interface ITriangleOptions {
      __layerId?: string;
      __layerName?: string;
    }
    interface IPolylineOptions {
      __layerId?: string;
      __layerName?: string;
    }
    interface ILineOptions {
      __layerId?: string;
      __layerName?: string;
    }
    interface IGroupOptions {
      __layerId?: string;
      __layerName?: string;
    }
    interface IImageOptions {
      __layerId?: string;
      __layerName?: string;
    }
  }
}
