import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ClimbingBoxLoader, BeatLoader } from "react-spinners";
import { 
    FiPlus, FiEdit2, FiTrash2, FiSearch, 
    FiTool, FiCheckCircle, FiX, FiAlertCircle 
} from "react-icons/fi";
import { 
    PageContainer, 
    PageHeader, 
    HeaderTitle, 
    Toolbar, 
    SearchBox, 
    TableCard, 
    Table, 
    ActionBtn, 
    Badge, 
    FormGroup, 
    ModalOverlay, 
    ModalContent, 
    ModalHeader 
} from "../../shared/components/UI";

/* ═══════════════════════════════════════════════════════════
   TIPOS E INTERFACES
═══════════════════════════════════════════════════════════ */
export interface Mecanica {
    id: string;
    nombre: string;
    especialidad: string;
    telefono: string;
    estado: "activo" | "inactivo";
    fecha_registro: string;
}

const schema = yup.object({
    nombre: yup.string().required("El nombre es requerido").min(3, "Mínimo 3 caracteres"),
    especialidad: yup.string().required("La especialidad es requerida"),
    telefono: yup.string().required("El teléfono es requerido"),
    estado: yup.string().oneOf(["activo", "inactivo"]).required(),
});

type MecanicaForm = yup.InferType<typeof schema>;

const MOCK_MECANICAS: Mecanica[] = [
    { id: "1", nombre: "Juan Pérez", especialidad: "Motores Diésel", telefono: "555-0101", estado: "activo", fecha_registro: "2024-01-15" },
    { id: "2", nombre: "Ricardo Gómez", especialidad: "Suspensión y Frenos", telefono: "555-0202", estado: "activo", fecha_registro: "2024-02-10" },
    { id: "3", nombre: "Elena Méndez", especialidad: "Electrónica Automotriz", telefono: "555-0303", estado: "activo", fecha_registro: "2024-03-05" },
    { id: "4", nombre: "Carlos Ruiz", especialidad: "Transmisiones", telefono: "555-0404", estado: "inactivo", fecha_registro: "2024-03-20" },
];

const LoaderOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  color: ${({ theme }) => theme.bg4};
  p { font-weight: 600; font-size: 1.1rem; }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: #FCA311;
  color: #000;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  transition: all 0.2s;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(252,163,17,0.3); }
`;

const ErrorText = styled.span`
  color: #ff4d4d;
  font-size: 0.75rem;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MecanicaManagement: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [mecanicas, setMecanicas] = useState<Mecanica[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMecanica, setEditingMecanica] = useState<Mecanica | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<MecanicaForm>({
        resolver: yupResolver(schema),
        defaultValues: { estado: "activo" }
    });

    useEffect(() => {
        const load = async () => {
            await new Promise(r => setTimeout(r, 1000));
            setMecanicas(MOCK_MECANICAS);
            setIsLoading(false);
        };
        load();
    }, []);

    const handleOpenModal = (mecanica?: Mecanica) => {
        if (mecanica) {
            setEditingMecanica(mecanica);
            setValue("nombre", mecanica.nombre);
            setValue("especialidad", mecanica.especialidad);
            setValue("telefono", mecanica.telefono);
            setValue("estado", mecanica.estado);
        } else {
            setEditingMecanica(null);
            reset({ nombre: "", especialidad: "", telefono: "", estado: "activo" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMecanica(null);
    };

    const onSubmit = async (data: MecanicaForm) => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 800));
        if (editingMecanica) {
            setMecanicas(prev => prev.map(m => m.id === editingMecanica.id ? { ...m, ...data } : m));
        } else {
            const newNode: Mecanica = {
                id: Math.random().toString(36).substr(2, 9),
                ...data,
                fecha_registro: new Date().toISOString().split('T')[0]
            };
            setMecanicas(prev => [newNode, ...prev]);
        }
        setIsSaving(false);
        handleCloseModal();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Estás seguro?")) return;
        setIsDeletingId(id);
        await new Promise(r => setTimeout(r, 800));
        setMecanicas(prev => prev.filter(m => m.id !== id));
        setIsDeletingId(null);
    };

    const filteredMecanicas = mecanicas.filter(m => 
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <PageContainer>
                <LoaderOverlay>
                    <ClimbingBoxLoader color="#FCA311" size={15} />
                    <p>Gestionando Mecánicas...</p>
                </LoaderOverlay>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiTool /> Mecánicas Técnicas</h1>
                    <p>Gestión de personal especializado y servicios de taller</p>
                </HeaderTitle>
                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input placeholder="Buscar mecánico..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    </SearchBox>
                    <button className="btn-primary" onClick={() => handleOpenModal()} style={{ background: '#FCA311', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiPlus /> Registrar Mecánico
                    </button>
                </Toolbar>
            </PageHeader>
            <TableCard>
                <Table>
                    <thead>
                        <tr>
                            <th>Mecánico</th>
                            <th>Especialidad</th>
                            <th>Teléfono</th>
                            <th>Estado</th>
                            <th>Registro</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMecanicas.map(m => (
                            <tr key={m.id}>
                                <td>
                                    <div style={{ fontWeight: 700 }}>{m.nombre}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>ID: {m.id}</div>
                                </td>
                                <td>{m.especialidad}</td>
                                <td>{m.telefono}</td>
                                <td>
                                    <Badge style={{ background: m.estado === 'activo' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: m.estado === 'activo' ? '#10B981' : '#EF4444' }}>
                                        {m.estado.toUpperCase()}
                                    </Badge>
                                </td>
                                <td>{m.fecha_registro}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <ActionBtn $variant="edit" onClick={() => handleOpenModal(m)} disabled={!!isDeletingId}><FiEdit2 /></ActionBtn>
                                    <ActionBtn $variant="delete" onClick={() => handleDelete(m.id)} disabled={!!isDeletingId}>{isDeletingId === m.id ? <BeatLoader size={5} color="#ff4d4d" /> : <FiTrash2 />}</ActionBtn>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableCard>

            {isModalOpen && (
                <ModalOverlay>
                    <ModalContent style={{ maxWidth: '600px' }}>
                        <ModalHeader>
                            <h2>{editingMecanica ? "Editar Mecánico" : "Registrar Nuevo Mecánico"}</h2>
                            <ActionBtn $variant="close" onClick={handleCloseModal}><FiX /></ActionBtn>
                        </ModalHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <FormGroup>
                                <label>Nombre Completo</label>
                                <input {...register("nombre")} placeholder="Ej: Roberto Sánchez" disabled={isSaving}/>
                                {errors.nombre && <ErrorText><FiAlertCircle /> {errors.nombre.message}</ErrorText>}
                            </FormGroup>
                            <FormGrid>
                                <FormGroup>
                                    <label>Especialidad</label>
                                    <select {...register("especialidad")} disabled={isSaving}>
                                        <option value="">Seleccionar...</option>
                                        <option value="Motores Diésel">Motores Diésel</option>
                                        <option value="Motores Gasolina">Motores Gasolina</option>
                                        <option value="Electrónica">Electrónica</option>
                                        <option value="Pintura">Pintura</option>
                                        <option value="Hojalatería">Hojalatería</option>
                                    </select>
                                    {errors.especialidad && <ErrorText><FiAlertCircle /> {errors.especialidad.message}</ErrorText>}
                                </FormGroup>
                                <FormGroup>
                                    <label>Teléfono</label>
                                    <input {...register("telefono")} placeholder="555-0000" disabled={isSaving}/>
                                    {errors.telefono && <ErrorText><FiAlertCircle /> {errors.telefono.message}</ErrorText>}
                                </FormGroup>
                            </FormGrid>
                            <FormGroup>
                                <label>Estado Operativo</label>
                                <select {...register("estado")} disabled={isSaving}>
                                    <option value="activo">Activo / Disponible</option>
                                    <option value="inactivo">Inactivo / En Permiso</option>
                                </select>
                            </FormGroup>
                            <SubmitBtn type="submit" disabled={isSaving}>
                                {isSaving ? <BeatLoader color="#000" size={8} /> : <><FiCheckCircle /> {editingMecanica ? "Guardar" : "Registrar"}</>}
                            </SubmitBtn>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default MecanicaManagement;
