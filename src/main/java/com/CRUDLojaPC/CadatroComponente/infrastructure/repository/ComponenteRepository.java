package com.CRUDLojaPC.CadatroComponente.infrastructure.repository;

import com.CRUDLojaPC.CadatroComponente.infrastructure.entitys.Componente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ComponenteRepository extends JpaRepository<Componente, Integer> {

    Optional<Componente> findByArmazenamento(String componente);
}
