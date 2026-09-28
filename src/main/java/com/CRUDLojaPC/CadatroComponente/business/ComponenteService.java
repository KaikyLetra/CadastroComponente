package com.CRUDLojaPC.CadatroComponente.business;

import com.CRUDLojaPC.CadatroComponente.infrastructure.entitys.Componente;
import com.CRUDLojaPC.CadatroComponente.infrastructure.repository.ComponenteRepository;
import org.springframework.stereotype.Service;

@Service
public class ComponenteService {

    private final ComponenteRepository repository;

    public ComponenteService(ComponenteRepository repository) {
        this.repository = repository;
    }

    public void salvarComponente(Componente componente){
        repository.saveAndFlush(componente);
    }

    public Componente buscarComponentePorArmazenamento(String armazenamento){
        return repository.findByArmazenamento(armazenamento).orElseThrow(
                () -> new RuntimeException("Armazenamento não encontrado")
        );
    }
}
