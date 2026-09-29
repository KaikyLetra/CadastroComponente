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

    public void deletarComponentePorArmazenamento(String armazenamento){
        repository.deleteByArmazenamento(armazenamento);
    }

    public void atualizarComponenteId(Integer id, Componente componente){
        Componente componenteEntity = repository.findById(id).orElseThrow( () ->
                new RuntimeException("Componente não encontrado"));
        Componente componenteAtualizado = Componente.builder()
                .nome(componente.getNome() != null ? componente.getNome() :
                        componenteEntity.getNome())
                .gabinete(componente.getGabinete() != null ? componente.getGabinete() :
                        componenteEntity.getGabinete())
                .cpu(componente.getCpu() != null ? componente.getCpu() :
                        componenteEntity.getCpu())
                .gpu(componente.getGpu() != null ? componente.getGpu() :
                        componenteEntity.getNome())
                .ram(componente.getRam() != null ? componente.getRam() :
                        componenteEntity.getRam())
                .dualchannel(componente.getDualchannel() != null ? componente.getDualchannel() :
                        componenteEntity.getDualchannel())
                .armazenamento(componente.getArmazenamento() != null ? componente.getArmazenamento() :
                        componenteEntity.getArmazenamento())
                .bluetooth(componente.getBluetooth() != null ? componente.getBluetooth() :
                        componenteEntity.getBluetooth())
                .idPC(componenteEntity.getIdPC())
                .build();

        repository.saveAndFlush(componenteAtualizado);
    }
}
