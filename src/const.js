export const NODES_STATES = {
    HEALTHY: 'healthy',
    SICK_LATENT_PHASE: 'sick-latent-phase',
    SICK_ACTIVE_PHASE: 'sick-active-phase',
    IMMUNE: 'immune',
    DECEASED: 'deceased'
};

export const NODES_STATES_CLASSES = {
    [NODES_STATES.HEALTHY]: 'healthy',
    [NODES_STATES.SICK_LATENT_PHASE]: 'sick-latent',
    [NODES_STATES.SICK_ACTIVE_PHASE]: 'sick-active',
    [NODES_STATES.DECEASED]: 'deceased',
    [NODES_STATES.IMMUNE]: 'immune'
};

export const NODES_STATES_LABELS = {
    [NODES_STATES.HEALTHY]: 'healthy',
    [NODES_STATES.SICK_LATENT_PHASE]: 'sick: latent',
    [NODES_STATES.SICK_ACTIVE_PHASE]: 'sick: active',
    [NODES_STATES.DECEASED]: 'deceased',
    [NODES_STATES.IMMUNE]: 'immune'
};

export const SIMULATION_PARAMS = {
    USE_RANDOM_GRAPH: false,
    NODES_COUNT: 250,
    M: 4,

    QUARANTINED_NODES: 0,
    LEAVING_HOUSE_CHANCE: 0.15,

    INITIALLY_INFECTED_NODES: 0.04,
    HEALTH_CARE_CAPACITY: 0.2,

    LATENT_PHASE_TIME: 14,
    TREATMENT_TIME: 10,
    CONTAGION_CHANCE: 0.05,
    RECOVERY_CHANCE: 0.995,
    OVERLOADED_RECOVERY_CHANCE: 0.95,

    ITERATIONS: 90,
    STEP_TIME: 100
};
