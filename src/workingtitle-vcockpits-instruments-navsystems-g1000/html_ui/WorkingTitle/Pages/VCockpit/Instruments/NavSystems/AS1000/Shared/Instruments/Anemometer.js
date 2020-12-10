class WT_Anemometer {
    /**
     * @param {*} update$ 
     * @param {WT_Plane_State} planeState 
     */
    constructor(update$, planeState) {
        const enableInAir = (observable) => {
            return planeState.inAir.pipe(
                rxjs.operators.switchMap(inAir => inAir ? observable : rxjs.of(null))
            );
        }

        const throttledUpdate$ = update$.pipe(
            rxjs.operators.throttleTime(200),
            rxjs.operators.share()
        );

        this.direction = WT_RX.observeSimVar(throttledUpdate$, "AMBIENT WIND DIRECTION", "degree");

        this.relativeDirection = rxjs.combineLatest(this.direction, planeState.heading).pipe(
            rxjs.operators.sample(update$),
            rxjs.operators.map(([windDirection, planeHeading]) => (windDirection + 180) % 360 - planeHeading)
        );

        this.speed = WT_RX.observeSimVar(throttledUpdate$, "AMBIENT WIND VELOCITY", "knots");
    }
}