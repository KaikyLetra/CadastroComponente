package com.CRUDLojaPC.CadatroComponente.infrastructure.entitys;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "componente")
@Entity

public class Componente {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer idPC;

    @Column(name = "nome", unique = true)
    private String nome;

    @Column(name = "gabinete")
    private String gabinete;

    @Column(name = "cpu", unique = true)
    private String cpu;

    @Column(name = "gpu", unique = true)
    private String gpu;

    @Column(name = "ram")
    private String ram;

    @Column(name = "dualchannel")
    private String dualchannel;

    @Column(name = "armazenamento")
    private String armazenamento;

    @Column(name = "bluetooth")
    private String bluetooth;




}
