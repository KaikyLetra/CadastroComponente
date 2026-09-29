package com.CRUDLojaPC.CadatroComponente.controller;

import com.CRUDLojaPC.CadatroComponente.business.ComponenteService;
import com.CRUDLojaPC.CadatroComponente.infrastructure.entitys.Componente;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/componente")
@RequiredArgsConstructor

public class ComponenteController {
    private final ComponenteService componenteService;

    @PostMapping
    public ResponseEntity<Void> salvarComponente(@RequestBody Componente componente){
        componenteService.salvarComponente(componente);
        return ResponseEntity.ok().build();
    }
    //Adiantei
    @GetMapping
    public ResponseEntity<Componente> buscarComponentePorArmazenamento(@RequestParam String armazenamento){
        return ResponseEntity.ok(componenteService.buscarComponentePorArmazenamento(armazenamento));
    }
    //Adiantei
    @DeleteMapping
    public ResponseEntity<Void> deletarComponentePorArmazenamento(@RequestParam String armazenamento){
        componenteService.deletarComponentePorArmazenamento(armazenamento);
        return ResponseEntity.ok().build();
    }
}
