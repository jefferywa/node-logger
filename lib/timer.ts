export class Timer {
  static hrtimeToMs(hr: number[]): number {
    return Math.ceil(hr[0] * 1e3 + hr[1] / 1e6);
  }
}
