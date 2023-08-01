/**
 * 持续点击
 */
import 'default-passive-events';
class KeepClick {
    constructor(op = {}) {
        const defaultOption = {
            intervalTime: 800, // 点击时间间隔
            dom: null, // 监听的点击元素
            canMoveDis: 5, // 发生移动时，此移动范围有效
        };
        this.data = {
            clickTimes: 0, // 有效点击次数
        }
        this.option = Object.assign(defaultOption, op);
        this.happenedMove = false; // 手指是否发生了滑动
        this.lastClickTime = null; // 手指离开的最后时间
        this.startTouche = null; // 触摸的起始位置
        this.init();
    }

    init() {
        const { dom } = this.option;
        const touchMovefun = this.touchMovefun = (e) => {
            e.preventDefault();
            this.handleTouchMove(e);
        }
        const touchEndfun = this.touchEndfun = (e) => {
            e.preventDefault();
            this.handleTouchEnd(e);
        }
        const touchStartfun = this.touchStartfun = (e) => {
            e.preventDefault();
            const { touches = [] } = e;
            if (touches.length > 1) { // 多个触摸(一个以上) 则无效
                return;
            }
            this.handleTouchStart(touches[0]);
            dom.addEventListener('touchmove', touchMovefun, { passive: false, capture: true  });
            dom.addEventListener('touchend', touchEndfun, { passive: false, capture: true  });
        }
        dom.addEventListener('touchstart', touchStartfun, { passive: false, capture: true  });
    }

    /**
     * 处理有手指触摸
     */
    handleTouchStart(toucheObj) {
        const { intervalTime } = this.option;
        this.startTouche = toucheObj;
        if (this.lastClickTime) { // 有触摸记录
            const nowTime = new Date().getTime();
            // 是否在设置的时间间隔内
            if (nowTime - this.lastClickTime <= intervalTime) {
                this.data.clickTimes += 1;
                const { clientX, clientY, pageX, pageY, screenX, screenY } = toucheObj;
                this.callBack({ clickTimes: this.data.clickTimes, clientX, clientY, pageX, pageY, screenX, screenY });
            } else {
                // 超出时间间隔
                this.lastClickTime = null;
                this.data.clickTimes = 0; // 此处可以设计为：超出多少时长，点击次数为 0， 不一定是时间间隔内，可以默认是时间间隔内
            }
        } else {
            // 没有上次触摸的记录
        }
    }

    /**
     * 处理手指滑动
     */
    handleTouchMove(e) {
        const { touches = [] } = e;
        if (touches.length > 1) { // 一个以上手指发生移动，视为无效
            this.happenedMove = true;
            return;
        }
        // 单个手指发生移动，距离在一定范围内都可接受，不然太灵敏
        const { clientX: endX, clientY: endY } = touches[0];  // 结束位置
        const { clientX: startX, clientY: startY } = this.startTouche; // 开始位置
        const { canMoveDis } = this.option;
        if (!(Math.abs(endX - startX) <= canMoveDis && Math.abs(endY - startY) <= canMoveDis)) {
            this.happenedMove = true;
        }
    }

    /**
     * 处理手指抬起
     * 1. 手指发生移动，视为滑动，点击无效
     * 2. 手指抬起，开始记录时间
     */
    handleTouchEnd(e) {
        const { dom } = this.option;
        const { touches = [] } = e;
        if (this.happenedMove) { // 手指发生了移动，视为无效点击
            this.lastClickTime = null;
            this.happenedMove = false;
            this.data.clickTimes = 0;
            return;
        }
        this.happenedMove = false;
        this.lastClickTime = new Date().getTime();
        if (!touches.length) { // 无手指在屏幕上时，移除监听
            dom.removeEventListener('touchmove', this.touchMovefun, { passive: false, capture: true  });
            dom.removeEventListener('touchend', this.touchEndfun, { passive: false, capture: true  });
        }
    }

    /**
     * 有效点击
     * @param {*} data 
     */
    callBack(data) {
        if (this.option.callback) {
            this.option.callback(data);
        }
    }

    /**
     * 销毁
     */
    destory() {
        const { dom } = this.option;
        dom.removeEventListener('touchstart', this.touchStartfun, { passive: false, capture: true  });
    }
}
export default KeepClick;