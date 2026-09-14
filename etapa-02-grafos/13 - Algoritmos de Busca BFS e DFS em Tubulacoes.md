graph LR
    ST01["ST-01: Estação Base"] -->|Corredor 1| DOC101["DOC-101: Doca Recebimento"]
    ST01 -->|Corredor 2| ALM201["ALM-201: Almoxarifado"]
    DOC101 -->|Corredor 3| ALM201
    ALM201 -->|Corredor 4| AMO301["AMO-301: Posto Amostragem"]
    AMO301 -->|Corredor 5| R101["R-101: Reator"]
    AMO301 -->|Corredor 6 - Rota Direta| DEP401["DEP-401: Depósito Final"]
    R101 -->|Corredor 7| DEP401
    DEP401 -->|Corredor 8 - Retorno| ST01