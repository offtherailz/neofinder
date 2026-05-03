export const CONFIG_KEYS = {
    SAVED_POSITION:'savedPosition',
    ACTIVE_HORIZON: 'activeHorizon',
    HORIZON_HEIGHT: 'horizonHeight',
    AUTO_UPDATE: 'autoUpdate',
    REFRESH_TIME: 'refreshTime',
    SHOW_ASTEROIDS: 'showAsteroids',
    FILTER: 'filter',
    EPHEM_PARAMS: 'ephemParams',
    CAMERA_SAMPLING: 'cameraSampling',
    MAX_OFFSET_ARCSEC: 'maxOffsetArcsec',
    FOV_SIZE: 'fovSize',
};

/** Default camera field of view in degrees: 30' × 20' */
export const DEFAULT_FOV_SIZE = { width: 0.5, height: 0.333 };

export const DEFAULT_CAMERA_SAMPLING = 1.055;
export const DEFAULT_MAX_OFFSET_ARCSEC = 10;

export const DEFAULT_EPHEM_PARAMS = {
    W: "j",
    mb: -30,
    mf: 30,
    dl: -90,
    du: 90,
    nl: 0,
    nu: 100,
    sort: "d",
    Parallax: 1,
    obscode: 500,
    long: "",
    lat: "",
    alt: "",
    int: 2,
    start: 0,
    raty: "a",
    mot: "m",
    dmot: "p",
    out: "f",
    sun: "x",
    oalt: 20
};